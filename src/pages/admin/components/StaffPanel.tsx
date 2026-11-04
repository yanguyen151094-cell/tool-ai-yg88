import { useCallback, useEffect, useState } from 'react';
import {
  buildRefLink,
  createStaff,
  listStaff,
  removeStaff,
  resetStaffPassword,
  setScanPermission,
  updateRefCode,
} from '@/lib/adminStaff';
import type { StaffRow } from '@/lib/adminStaff';

const formatNumber = (value: number) => Number(value ?? 0).toLocaleString('vi-VN');

export default function StaffPanel() {
  const [rows, setRows] = useState<StaffRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [refCode, setRefCode] = useState('');

  const [copied, setCopied] = useState('');
  const [resetId, setResetId] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [editRefId, setEditRefId] = useState<string | null>(null);
  const [editRefValue, setEditRefValue] = useState('');

  const copyLink = async (code: string) => {
    try {
      await navigator.clipboard.writeText(buildRefLink(code));
      setCopied(code);
      window.setTimeout(() => setCopied(''), 1800);
    } catch {
      setCopied('');
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await listStaff();
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
      if (success) setNotice(success);
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
      const result = await createStaff({
        username: name,
        password,
        ref_code: refCode.trim() || undefined,
      });
      setUsername('');
      setPassword('');
      setRefCode('');
      setNotice(
        `Đã tạo admin đại lý ${name} với mã link "${result.ref_code}". Gửi tên đăng nhập, mật khẩu và link đại lý cho họ.`,
      );
    }, '');
  };

  const inputClass =
    'w-full rounded-md border border-background-300/50 bg-background-50/70 px-3 py-2.5 font-mono text-[12px] text-foreground-950 placeholder:text-foreground-600 focus:border-primary-500/60';

  return (
    <div>
      <p className="font-mono text-[10px] tracking-[0.2em] text-primary-500 uppercase">
        $ staff --manage
      </p>
      <h2 className="mt-1 font-heading text-xl font-bold text-foreground-950">
        Phân quyền admin &amp; đại lý
      </h2>
      <p className="mt-1 text-sm text-foreground-500">
        Mỗi admin cấp dưới có quyền <strong className="text-foreground-300">cộng điểm</strong>,{' '}
        <strong className="text-foreground-300">xem thông tin khách</strong> và{' '}
        <strong className="text-foreground-300">cấp lại mật khẩu</strong>. Họ có một link đăng ký
        riêng và chỉ thấy khách đăng ký qua link đó. Quyền <strong className="text-foreground-300">quét mã nhà cái</strong>{' '}
        phải được chủ web bật riêng cho từng admin.
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
            thêm admin đại lý
          </p>
          <div className="mt-3 space-y-3">
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Tên đăng nhập (vd: daily01)"
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
            <div>
              <input
                value={refCode}
                onChange={(event) => setRefCode(event.target.value)}
                placeholder="Mã link đại lý (vd: daily01)"
                autoCapitalize="none"
                spellCheck={false}
                className={inputClass}
              />
              <p className="mt-1 font-mono text-[9px] leading-relaxed text-foreground-600">
                để trống thì mã được tạo tự động theo tên đăng nhập.
              </p>
            </div>
            <p className="flex items-start gap-2 rounded-md border hairline bg-background-50/60 px-3 py-2 font-mono text-[10px] leading-relaxed text-foreground-500">
              <i className="ri-shield-check-line mt-0.5 text-[12px] text-primary-500" />
              quyền cố định: cộng điểm, xem khách của mình, cấp lại mật khẩu khách. Quyền quét mã nhà cái bật riêng sau khi tạo.
            </p>
            <button
              type="submit"
              disabled={busy}
              className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md bg-primary-500 px-3 py-2.5 font-mono text-[11px] font-bold whitespace-nowrap text-background-50 transition-colors hover:bg-primary-400 disabled:opacity-60"
            >
              <i className="ri-user-add-line" />
              tạo admin đại lý
            </button>
          </div>
        </form>

        <div className="rounded-lg border hairline bg-background-100/60 p-4 lg:col-span-7">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] tracking-[0.16em] text-foreground-600 uppercase">
              danh sách admin ({rows.length})
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
              chưa có admin đại lý nào. Tạo ở khung bên trái.
            </p>
          ) : (
            <div className="mt-3 max-h-[640px] space-y-2 overflow-y-auto pr-1">
              {rows.map((row) => (
                <div key={row.user_id} className="rounded-md border hairline bg-background-50/60 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-[13px] text-foreground-950">
                        {row.username}
                      </p>
                      <p className="font-mono text-[10px] text-foreground-600">
                        {formatNumber(row.customer_count)} khách · +
                        {formatNumber(row.total_credited)} coin đã cộng
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                      {row.can_scan_bookmakers && (
                        <span className="flex items-center gap-1 rounded border border-accent-500/40 bg-accent-500/10 px-2 py-1 font-mono text-[9px] tracking-[0.1em] text-accent-500 uppercase">
                          <i className="ri-scan-2-line text-[11px]" />
                          quét mã
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 rounded border border-primary-500/30 bg-primary-500/10 px-2 py-1 font-mono text-[9px] tracking-[0.1em] text-primary-500 uppercase">
                        <i className="ri-shield-user-line text-[11px]" />
                        admin đại lý
                      </span>
                    </div>
                  </div>

                  {row.ref_code ? (
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                      <div className="flex min-w-0 flex-1 items-center gap-2 rounded border hairline bg-background-50/80 px-2 py-1.5">
                        <i className="ri-link shrink-0 text-[12px] text-primary-500" />
                        <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-foreground-400">
                          {buildRefLink(row.ref_code)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyLink(row.ref_code as string)}
                        className="flex shrink-0 cursor-pointer items-center justify-center gap-1 rounded border border-primary-500/40 px-2.5 py-1.5 font-mono text-[10px] whitespace-nowrap text-primary-500 transition-colors hover:bg-primary-500/10"
                      >
                        <i className={copied === row.ref_code ? 'ri-check-line' : 'ri-file-copy-line'} />
                        {copied === row.ref_code ? 'đã chép' : 'chép link'}
                      </button>
                    </div>
                  ) : (
                    <p className="mt-2 font-mono text-[10px] text-accent-500">
                      chưa có mã đại lý — bấm "đổi mã link" để cấp.
                    </p>
                  )}

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        run(async () => {
                          await setScanPermission(row.user_id, !row.can_scan_bookmakers);
                        }, `Đã ${row.can_scan_bookmakers ? 'tắt' : 'bật'} quyền quét mã nhà cái cho ${row.username}.`)
                      }
                      className={`flex cursor-pointer items-center gap-1 rounded border px-2.5 py-1.5 font-mono text-[10px] whitespace-nowrap transition-colors disabled:opacity-60 ${
                        row.can_scan_bookmakers
                          ? 'border-accent-500/40 text-accent-500 hover:bg-accent-500/10'
                          : 'hairline text-foreground-400 hover:text-primary-500'
                      }`}
                    >
                      <i className={row.can_scan_bookmakers ? 'ri-lock-line' : 'ri-scan-2-line'} />
                      {row.can_scan_bookmakers ? 'tắt quét mã' : 'bật quét mã'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditRefId(editRefId === row.user_id ? null : row.user_id);
                        setEditRefValue(row.ref_code ?? '');
                        setResetId(null);
                        setRemoveId(null);
                      }}
                      className="flex cursor-pointer items-center gap-1 rounded border hairline px-2.5 py-1.5 font-mono text-[10px] whitespace-nowrap text-foreground-400 transition-colors hover:text-primary-500"
                    >
                      <i className="ri-links-line" />
                      đổi mã link
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setResetId(resetId === row.user_id ? null : row.user_id);
                        setResetPassword('');
                        setRemoveId(null);
                        setEditRefId(null);
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
                        setEditRefId(null);
                      }}
                      className="flex cursor-pointer items-center gap-1 rounded border border-accent-500/40 px-2.5 py-1.5 font-mono text-[10px] whitespace-nowrap text-accent-500 transition-colors hover:bg-accent-500/10"
                    >
                      <i className="ri-user-unfollow-line" />
                      thu hồi quyền
                    </button>
                  </div>

                  {editRefId === row.user_id && (
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                      <input
                        value={editRefValue}
                        onChange={(event) => setEditRefValue(event.target.value)}
                        placeholder="mã link mới (vd: daily01)"
                        autoCapitalize="none"
                        spellCheck={false}
                        className={inputClass}
                      />
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          run(async () => {
                            const result = await updateRefCode(row.user_id, editRefValue);
                            setEditRefId(null);
                            setNotice(`Đã đổi mã link của ${row.username} thành "${result.ref_code}".`);
                          }, '')
                        }
                        className="cursor-pointer rounded-md bg-primary-500 px-4 py-2.5 font-mono text-[11px] font-bold whitespace-nowrap text-background-50 hover:bg-primary-400 disabled:opacity-60"
                      >
                        lưu
                      </button>
                    </div>
                  )}

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
                            await resetStaffPassword(row.user_id, resetPassword);
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
                        Thu hồi quyền của {row.username}? Họ không vào được khu quản trị nữa, khách
                        cũ vẫn thuộc đại lý này.
                      </p>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          run(async () => {
                            await removeStaff(row.user_id);
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