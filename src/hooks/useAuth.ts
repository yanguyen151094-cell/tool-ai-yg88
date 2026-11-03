import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { authMessage } from '@/lib/authErrors';
import { accountToEmail, looksLikePhone, normalizePhone } from '@/lib/phone';

export type PlayerProfile = {
  id: string;
  email: string | null;
  username: string | null;
  coins: number;
  phone: string | null;
  telegram: string | null;
};

const messageOf = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState<'owner' | 'staff' | null>(null);
  const [canViewCustomers, setCanViewCustomers] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const [error, setError] = useState('');

  const loadProfile = useCallback(
    async (
      userId: string,
      email: string | null,
      username: string | null,
      phone: string | null,
      telegram: string | null,
    ) => {
      setProfileLoading(true);
      setAccessChecked(false);
      setError('');
      try {
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('id, email, username, coins, phone, telegram')
          .eq('id', userId)
          .maybeSingle();
        if (fetchError) throw fetchError;

        if (data) {
          setProfile(data as PlayerProfile);
        } else {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({ id: userId, email, username, phone, telegram });
          if (insertError) throw insertError;
          const { data: created } = await supabase
            .from('profiles')
            .select('id, email, username, coins, phone, telegram')
            .eq('id', userId)
            .maybeSingle();
          setProfile((created as PlayerProfile | null) ?? null);
        }

        const { data: adminRow, error: adminError } = await supabase
          .from('admin_users')
          .select('user_id, role, can_view_customers')
          .eq('user_id', userId)
          .maybeSingle();
        if (adminError) throw adminError;

        const role = (adminRow?.role as 'owner' | 'staff' | undefined) ?? null;
        setIsAdmin(Boolean(adminRow));
        setAdminRole(role);
        setCanViewCustomers(role === 'owner' || Boolean(adminRow?.can_view_customers));
      } catch (caught) {
        setError(messageOf(caught, 'Không tải được hồ sơ người chơi.'));
      } finally {
        setProfileLoading(false);
        setAccessChecked(true);
      }
    },
    [],
  );

  useEffect(() => {
    let active = true;

    const boot = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!active) return;
        setSession(data.session ?? null);
      } catch {
        if (active) setSession(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    boot();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const user = session?.user;
    if (!user) {
      setProfile(null);
      setIsAdmin(false);
      setAdminRole(null);
      setCanViewCustomers(false);
      setAccessChecked(false);
      return;
    }
    loadProfile(
      user.id,
      user.email ?? null,
      (user.user_metadata?.username as string | undefined) ?? null,
      (user.user_metadata?.phone as string | undefined) ?? null,
      (user.user_metadata?.telegram as string | undefined) ?? null,
    );
  }, [session?.user?.id, loadProfile]);

  /** Đăng nhập bằng tên đăng nhập, số điện thoại hoặc email. */
  const signIn = useCallback(async (account: string, password: string) => {
    const value = account.trim();
    const email = accountToEmail(value);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      if (looksLikePhone(value)) {
        const detail = signInError.message.toLowerCase();
        if (detail.includes('invalid login credentials')) {
          throw new Error(
            'Sai tên đăng nhập hoặc mật khẩu.\nNếu chưa có tài khoản, chuyển sang tab "Đăng ký" để tạo.',
          );
        }
      }
      throw new Error(authMessage(signInError));
    }
  }, []);

  /**
   * Đăng ký bằng tên thường + số điện thoại / Telegram:
   * máy chủ tạo tài khoản đã xác nhận sẵn, không cần email, không chờ mã xác nhận.
   */
  const signUpWithContact = useCallback(
    async (input: {
      username: string;
      password: string;
      phone: string;
      telegram: string;
    }) => {
      const normalized = normalizePhone(input.phone);
      const { data, error: invokeError } = await supabase.functions.invoke('phone-auth', {
        body: {
          username: input.username.trim(),
          rawPhone: input.phone.trim(),
          password: input.password,
          telegram: input.telegram.trim(),
        },
      });

      if (invokeError) {
        throw new Error(
          'Không gọi được máy chủ đăng ký.\nAnh kiểm tra mạng rồi thử lại giúp em nhé.',
        );
      }

      const result = data as
        | { ok?: boolean; email?: string; code?: string; message?: string }
        | null;

      if (!result || result.ok !== true || !result.email) {
        throw new Error(result?.message || 'Chưa tạo được tài khoản.');
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: result.email,
        password: input.password,
      });
      if (signInError) throw new Error(authMessage(signInError));

      return { phone: normalized };
    },
    [],
  );

  /**
   * Đăng nhập quản trị bằng tên đăng nhập (không cần email).
   * Lần đầu, máy chủ sẽ tự tạo tài khoản admin với tên + mật khẩu này.
   */
  const signInWithUsername = useCallback(async (username: string, password: string) => {
    const clean = username.trim().toLowerCase();
    const { data, error: invokeError } = await supabase.functions.invoke('admin-login', {
      body: { username: clean, password },
    });

    if (invokeError) {
      throw new Error(
        'Không gọi được máy chủ đăng nhập quản trị.\nKiểm tra kết nối bằng nút "kiểm tra kết nối" bên dưới.',
      );
    }

    const result = data as { ok?: boolean; email?: string; message?: string } | null;
    if (!result || result.ok !== true || typeof result.email !== 'string') {
      throw new Error(result?.message || 'Không tạo được phiên đăng nhập quản trị.');
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: result.email,
      password,
    });
    if (signInError) {
      const detail = signInError.message.toLowerCase();
      if (detail.includes('invalid login credentials')) {
        throw new Error(
          'Sai tên đăng nhập hoặc mật khẩu.\nNhân viên mới do chủ web tạo trong tab "Phân quyền admin".',
        );
      }
      throw new Error(authMessage(signInError));
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, username: string) => {
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    if (signUpError) throw new Error(authMessage(signUpError));

    const identities = data.user?.identities;
    if (data.user && Array.isArray(identities) && identities.length === 0) {
      throw new Error(authMessage({ message: 'User already registered' }));
    }

    return { needsConfirm: !data.session };
  }, []);

  /**
   * Đăng nhập tài khoản demo dùng sẵn (demo@yg88.local).
   * Máy chủ tự tạo lại nếu chưa có, nên lúc nào cũng vào được.
   */
  const signInDemo = useCallback(async () => {
    const { data, error: invokeError } = await supabase.functions.invoke('demo-login', {
      body: { mode: 'demo' },
    });

    if (invokeError) {
      throw new Error(
        'Không gọi được máy chủ tài khoản demo.\nAnh thử lại sau ít giây giúp em nhé.',
      );
    }

    const result = data as
      | { ok?: boolean; email?: string; password?: string; message?: string }
      | null;

    if (!result || result.ok !== true || !result.email || !result.password) {
      throw new Error(result?.message || 'Chưa tạo được tài khoản demo.');
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: result.email,
      password: result.password,
    });
    if (signInError) throw new Error(authMessage(signInError));
  }, []);

  const resendConfirmation = useCallback(async (email: string) => {
    const { error: resendError } = await supabase.auth.resend({ type: 'signup', email });
    if (resendError) throw new Error(authMessage(resendError));
  }, []);

  const checkConnection = useCallback(async () => {
    const url = (import.meta.env.VITE_PUBLIC_SUPABASE_URL as string | undefined) ?? '';
    const key = (import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY as string | undefined) ?? '';
    const lines: string[] = [];
    lines.push(`máy chủ: ${url || 'chưa cấu hình'}`);

    try {
      const { count, error: readError } = await supabase
        .from('games')
        .select('id', { count: 'exact', head: true });
      if (readError) {
        lines.push(`đọc dữ liệu game: LỖI — ${readError.message}`);
      } else {
        lines.push(`đọc dữ liệu game: OK (${count ?? 0} phòng)`);
      }
    } catch (caught) {
      lines.push(`đọc dữ liệu game: LỖI — ${messageOf(caught, 'không rõ')}`);
    }

    try {
      const { count: adminCount, error: adminReadError } = await supabase
        .from('admin_users')
        .select('user_id', { count: 'exact', head: true });
      if (adminReadError) {
        lines.push(`bảng quyền admin: LỖI — ${adminReadError.message}`);
      } else {
        lines.push(`bảng quyền admin: OK (${adminCount ?? 0} tài khoản)`);
      }
    } catch (caught) {
      lines.push(`bảng quyền admin: LỖI — ${messageOf(caught, 'không rõ')}`);
    }

    try {
      const response = await fetch(`${url}/auth/v1/settings`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
      });
      if (!response.ok) {
        lines.push(`dịch vụ đăng nhập: LỖI ${response.status}`);
      } else {
        const settings = (await response.json()) as {
          disable_signup?: boolean;
          mailer_autoconfirm?: boolean;
          external?: { email?: boolean };
        };
        lines.push(
          `đăng ký bằng email: ${
            settings.disable_signup ? 'ĐANG TẮT (không tạo được tài khoản)' : 'bật'
          }`,
        );
        lines.push(
          `xác nhận email: ${
            settings.mailer_autoconfirm ? 'không cần xác nhận' : 'BẮT BUỘC xác nhận qua email'
          }`,
        );
        if (settings.external && settings.external.email === false) {
          lines.push('nhà cung cấp Email: ĐANG TẮT trong Supabase');
        }
      }
    } catch (caught) {
      lines.push(`dịch vụ đăng nhập: LỖI — ${messageOf(caught, 'không kết nối được')}`);
    }

    return lines;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setIsAdmin(false);
    setAdminRole(null);
    setCanViewCustomers(false);
  }, []);

  return {
    session,
    user: session?.user ?? null,
    profile,
    isAdmin,
    adminRole,
    canViewCustomers,
    loading,
    profileLoading,
    accessChecked,
    error,
    signIn,
    signInWithUsername,
    signUp,
    signUpWithContact,
    signInDemo,
    resendConfirmation,
    checkConnection,
    signOut,
    refresh: () => {
      const user = session?.user;
      if (user) {
        loadProfile(
          user.id,
          user.email ?? null,
          (user.user_metadata?.username as string | undefined) ?? null,
          (user.user_metadata?.phone as string | undefined) ?? null,
          (user.user_metadata?.telegram as string | undefined) ?? null,
        );
      }
    },
  };
}