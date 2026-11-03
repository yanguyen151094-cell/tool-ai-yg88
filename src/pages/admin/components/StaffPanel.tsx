import { useCallback, useEffect, useState } from 'react';
import { callAdminStaff } from '@/lib/adminStaff';
import type { StaffRow } from '@/lib/adminStaff';

export default function StaffPanel() {
  const [rows, setRows] = useState<StaffRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [resetId, setResetId] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [removeId, setRemoveId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await callAdminStaff<{ items: StaffRow[] }>({ action: 'list_staff' });
      setRows(result.items ?? []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Không tải được danh sách.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (task: () => Promise<void>, success: string) => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await task();
      setNotice(success);
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Thao tác không thành công.');
    } finally {
      setBusy(false);
    }
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = username.trim().toLowerCase();
    if (!/^[a-z0-9._-]{3,24}$/.test(name)) {
      setError('Tên đăng nhập 3-24 ký tự: chữ thường không dấu, số, dấu chấm, gạch dưới, gạch ngang.');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu cần từ 6 ký tự.');
      return;
    }
    await run(async () => {
      await callAdminStaff({ action: 'create_staff', username: name, password, can_view: false });
      setUsername('');
      setPassword('');
    }, `Đã tạo nhân viên ${name}. Anh gửi tên đăng nhập và mật khẩu cho họ vào /admin.`);
  };

  const inputClass =
    'w-full rounded-md border border-background-300/50 bg-background-50/70 px-3 py-2.5 font-mono text-[12px] text-foreground-950 placeholder:text-foreground-600 focus:border-primary-500/60';

  return (
    <div>
      <p className="font-mono text-[10px] tracking-[0.2em] text-primary-500 uppercase">
        $ staff --manage
      </p>
      <h2 className="mt-1 font-heading text-xl font-bold text-foreground-950">Phân quyền admin</h2>
      <p className="mt-1 text-sm text-foreground-500">
        Nhân viên cấp dưới <strong className="text-foreground-300">chỉ được cộng điểm</strong> cho
        khách. Họ không xem được danh sách khách, không sửa coin, không đổi mật khẩu hay xóa tài
        khoản, cũng không vào được các mục quản lý game, Baccarat và nội dung.
      </p>

      {notice && (
        <div className="mt-4 flex items-center gap-2 rounded-md border border-primary-500/30 bg-primary-500/10 px-3 py-2">
          <i className="ri-checkbox-circle-line text-[13px] text-primary-500" />
          <p className="font-mono text-[11px] text-primary-500">{notice}</p>
        </div>
      )}
      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-md border border-accent-500/40 bg-accent-500/10 px-3 py-2">
          <i className="ri-error-warning-line text-[13px] text-accent-500" />
          <p className="font-mono text-[11px] text-accent-500">{error}</p>
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <form
          onSubmit={handleCreate}
          className="rounded-lg border hairline bg-background-100/60 p-4 lg:col-span-5"
        >
          <p className="font-mono text-[10px] tracking-[0.16em] text-foreground-600 uppercase">
            thêm nhân viên
          </p>
          <div className="mt-3 space-y-3">
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Tên đăng nhập (vd: nv01)"
              autoCapitalize="none"
              spellCheck={false}
              className={inputClass}
            />
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Mật khẩu (từ 6 ký tự)"
              type="text"
              autoComplete="off"
              className={inputClass}
            />
            <p className="flex items-start gap-2 rounded-md border hairline bg-background-50/60 px-3 py-2 font-mono text-[10px] leading-relaxed text-foreground-500">
              <i className="ri-shield-check-line mt-0.5 text-[12px] text-primary-500" />
              quyền cố định: chỉ cộng điểm cho khách.
            </p>
            <button
              type="submit"
              disabled={busy}
              className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md bg-primary-500 px-3 py-2.5 font-mono text-[11px] font-bold whitespace-nowrap text-background-50 transition-colors hover:bg-primary-400 disabled:opacity-60"
            >
              <i className="ri-user-add-line" />
              tạo nhân viên
            </button>
          </div>
        </form>

        <div className="rounded-lg border hairline bg-background-100/60 p-4 lg:col-span-7">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] tracking-[0.16em] text-foreground-600 uppercase">
              danh sách nhân viên ({rows.length})
            </p>
            <button
              type="button"
              onClick={load}
              className="flex cursor-pointer items-center gap-1 font-mono text-[10px] whitespace-nowrap text-foreground-400 transition-colors hover:text-primary-500"
            >
              <i className="ri-refresh-line" />
              tải lại
            </button>
          </div>

          {loading ? (
            <p className="mt-4 font-mono text-[11px] text-foreground-500">đang tải...</p>
          ) : rows.length === 0 ? (
            <p className="mt-4 font-mono text-[11px] text-foreground-500">
              chưa có nhân viên nào. Tạo ở khung bên trái.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {rows.map((row) => (
                <div key={row.user_id} className="rounded-md border hairline bg-background-50/60 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-[13px] text-foreground-950">
                        {row.username}
                      </p>
                      <p className="font-mono text-[10px] text-foreground-600">chỉ cộng điểm</p>
                    </div>
                    <span className="flex shrink-0 items-center gap-1.5 rounded border border-primary-500/30 bg-primary-500/10 px-2 py-1 font-mono text-[9px] tracking-[0.1em] text-primary-500 uppercase">
                      <i className="ri-coins-line text-[11px]" />
                      chỉ cộng điểm
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setResetId(resetId === row.user_id ? null : row.user_id);
                        setResetPassword('');
                        setRemoveId(null);
                      }}
                      className="flex cursor-pointer items-center gap-1 rounded border hairline px-2.5 py-1.5 font-mono text-[10px] whitespace-nowrap text-foreground-400 transition-colors hover:text-primary-500"
                    >
                      <i className="ri-key-2-line" />
                      đổi mật khẩu
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRemoveId(removeId === row.user_id ? null : row.user_id);
                        setResetId(null);
                      }}
                      className="flex cursor-pointer items-center gap-1 rounded border border-accent-500/40 px-2.5 py-1.5 font-mono text-[10px] whitespace-nowrap text-accent-500 transition-colors hover:bg-accent-500/10"
                    >
                      <i className="ri-user-unfollow-line" />
                      thu hồi quyền
                    </button>
                  </div>

                  {resetId === row.user_id && (
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                      <input
                        value={resetPassword}
                        onChange={(event) => setResetPassword(event.target.value)}
                        placeholder="Mật khẩu mới (từ 6 ký tự)"
                        autoComplete="off"
                        className={inputClass}
                      />
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          run(async () => {
                            await callAdminStaff({
                              action: 'reset_password',
                              user_id: row.user_id,
                              password: resetPassword,
                            });
                            setResetId(null);
                            setResetPassword('');
                          }, `Đã đổi mật khẩu cho ${row.username}.`)
                        }
                        className="cursor-pointer rounded-md bg-primary-500 px-4 py-2.5 font-mono text-[11px] font-bold whitespace-nowrap text-background-50 hover:bg-primary-400 disabled:opacity-60"
                      >
                        lưu
                      </button>
                    </div>
                  )}

                  {removeId === row.user_id && (
                    <div className="mt-2 flex flex-wrap items-center gap-2 rounded-md border border-accent-500/30 bg-accent-500/10 px-3 py-2">
                      <p className="flex-1 font-mono text-[11px] text-accent-500">
                        Thu hồi quyền của {row.username}? Họ không vào được khu quản trị nữa.
                      </p>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          run(async () => {
                            await callAdminStaff({ action: 'remove_staff', user_id: row.user_id });
                            setRemoveId(null);
                          }, `Đã thu hồi quyền của ${row.username}.`)
                        }
                        className="cursor-pointer rounded-md border border-accent-500/60 px-3 py-1.5 font-mono text-[10px] font-bold whitespace-nowrap text-accent-500 hover:bg-accent-500/10 disabled:opacity-60"
                      >
                        xác nhận
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}