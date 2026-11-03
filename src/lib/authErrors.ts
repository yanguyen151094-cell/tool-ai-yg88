type RawAuthError = {
  message?: string;
  code?: string;
  status?: number;
};

const textOf = (error: unknown): string => {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    const value = (error as RawAuthError).message;
    return typeof value === 'string' ? value : '';
  }
  return '';
};

const statusOf = (error: unknown): number | undefined => {
  if (!error || typeof error !== 'object') return undefined;
  const value = (error as RawAuthError).status;
  return typeof value === 'number' ? value : undefined;
};

const has = (text: string, ...needles: string[]) =>
  needles.some((needle) => text.includes(needle));

const withServerHint = (message: string) =>
  `${message}\nBấm "kiểm tra kết nối" bên dưới để xem Supabase đang báo gì.`;

/**
 * Dịch lỗi xác thực của Supabase sang tiếng Việt kèm hướng xử lý cụ thể.
 */
export function authMessage(
  error: unknown,
  fallback = 'Không thể xác thực, vui lòng thử lại.',
): string {
  const raw = textOf(error).trim();
  const status = statusOf(error);
  const low = raw.toLowerCase();

  if (!raw) {
    return status === 401
      ? withServerHint('Máy chủ từ chối kết nối (401). Khoá API có thể đã bị đổi hoặc thu hồi.')
      : fallback;
  }

  if (has(low, 'failed to fetch', 'networkerror', 'load failed', 'fetch failed')) {
    return withServerHint(
      'Không kết nối được tới Supabase. Dự án có thể đang bị tạm dừng (paused) hoặc mất mạng.',
    );
  }

  if (has(low, 'invalid api key', 'no api key', 'jwt')) {
    return withServerHint(
      'Khoá API của Supabase không hợp lệ nên mọi thao tác đều bị chặn. Cần cấu hình lại khoá trong dự án.',
    );
  }

  if (has(low, 'invalid login credentials')) {
    return 'Sai email hoặc mật khẩu.\nNếu đây là lần đầu, chuyển sang tab "Tạo tài khoản" để tạo tài khoản quản trị.';
  }

  if (has(low, 'email not confirmed')) {
    return 'Tài khoản đã tạo nhưng chưa xác nhận email.\nBấm "gửi lại email xác nhận" bên dưới, mở hộp thư (cả mục spam) rồi bấm link xác nhận.';
  }

  if (has(low, 'user already registered', 'already registered', 'already been registered')) {
    return 'Email này đã có tài khoản rồi.\nChuyển sang tab "Đăng nhập" và dùng đúng mật khẩu đã đặt.';
  }

  if (has(low, 'signups not allowed', 'signup is disabled', 'email signups are disabled')) {
    return withServerHint(
      'Supabase đang tắt chức năng đăng ký bằng email nên không thể tạo tài khoản mới. Cần bật lại trong phần Authentication của Supabase.',
    );
  }

  if (has(low, 'password should be at least', 'password is too short', 'weak password')) {
    return 'Mật khẩu quá ngắn. Supabase yêu cầu tối thiểu 6 ký tự, nên dùng 8 ký tự trở lên cho chắc.';
  }

  if (has(low, 'unable to validate email', 'email address is invalid', 'invalid email')) {
    return 'Email không hợp lệ. Dùng email thật, ví dụ tenban@gmail.com.';
  }

  if (has(low, 'user not found')) {
    return 'Không tìm thấy tài khoản với email này.\nKiểm tra lại chính tả hoặc tạo tài khoản mới.';
  }

  if (has(low, 'rate limit', 'too many requests', 'over_email_send_rate_limit')) {
    return 'Gửi email quá nhiều lần nên Supabase tạm chặn.\nChờ khoảng 5-10 phút rồi thử lại.';
  }

  if (has(low, 'database error', 'unexpected_failure')) {
    return withServerHint(`Máy chủ Supabase gặp lỗi khi xử lý: ${raw}`);
  }

  return status && status >= 500
    ? withServerHint(`Máy chủ Supabase đang lỗi (${status}): ${raw}`)
    : raw;
}