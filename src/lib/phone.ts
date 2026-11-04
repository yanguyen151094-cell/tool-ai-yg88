const PHONE_DOMAIN = 'phone.yg88.local';
const USER_DOMAIN = 'user.yg88.local';
const ADMIN_DOMAIN = 'admin.local';

/** Chuẩn hoá số điện thoại Việt Nam về dạng 0xxxxxxxxx (10 số). */
export function normalizePhone(raw: string): string {
  let digits = String(raw ?? '').replace(/\D/g, '');
  if (digits.startsWith('84') && digits.length === 11) digits = `0${digits.slice(2)}`;
  if (digits.length === 9) digits = `0${digits}`;
  return digits;
}

export function isValidPhone(raw: string): boolean {
  return /^0\d{9}$/.test(normalizePhone(raw));
}

/** Email nội bộ sinh ra từ số điện thoại (dùng để đăng nhập, không gửi đi đâu). */
export function phoneToEmail(raw: string): string {
  return `${normalizePhone(raw)}@${PHONE_DOMAIN}`;
}

/** Email nội bộ sinh ra từ tên đăng nhập (bỏ dấu, bỏ khoảng trắng). */
export function usernameToEmail(raw: string): string {
  return `${usernameSlug(raw)}@${USER_DOMAIN}`;
}

/** Email nội bộ của tài khoản quản trị (admin chủ web / nhân viên). */
export function usernameToAdminEmail(raw: string): string {
  return `${usernameSlug(raw)}@${ADMIN_DOMAIN}`;
}

/** "Nguyễn Văn A" -> "nguyenvana" */
export function usernameSlug(raw: string): string {
  return String(raw ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

export function isValidUsername(raw: string): boolean {
  const slug = usernameSlug(raw);
  return slug.length >= 3 && slug.length <= 30;
}

/** Nhập vào email hay số điện thoại đều nhận ra được. */
export function looksLikePhone(value: string): boolean {
  return !value.includes('@');
}

/**
 * Đổi ô đăng nhập thành email thật dùng cho Supabase:
 * - có "@" thì coi là email
 * - 10 số (hoặc +84...) thì coi là số điện thoại
 * - còn lại là tên đăng nhập người chơi
 */
export function accountToEmail(account: string): string {
  const value = account.trim();
  if (value.includes('@')) return value;
  if (isValidPhone(value)) return phoneToEmail(value);
  return usernameToEmail(value);
}

/**
 * Danh sách email cần thử khi đăng nhập:
 * người chơi dùng @user.yg88.local, admin dùng @admin.local.
 * Nhờ vậy một ô đăng nhập dùng được cho cả hai loại tài khoản.
 */
export function loginEmailCandidates(account: string): string[] {
  const value = account.trim();
  if (!value) return [];
  if (value.includes('@')) return [value];
  if (isValidPhone(value)) return [phoneToEmail(value), usernameToAdminEmail(value)];
  const slug = usernameSlug(value);
  const candidates = [`${slug}@${USER_DOMAIN}`, `${slug}@${ADMIN_DOMAIN}`];
  return candidates.filter((item, index) => candidates.indexOf(item) === index);
}

/** Email hệ thống tự sinh, admin không cần nhìn thấy. */
export function isSyntheticEmail(email: string | null | undefined): boolean {
  const value = String(email ?? '');
  return value.endsWith(`@${PHONE_DOMAIN}`) || value.endsWith(`@${USER_DOMAIN}`);
}

/** Rút gọn hiển thị: 0901 234 567 */
export function prettyPhone(raw: string): string {
  const digits = normalizePhone(raw);
  if (digits.length !== 10) return raw;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
}

/** Chuẩn hoá tên telegram: bỏ @, bỏ link t.me */
export function normalizeTelegram(raw: string): string {
  return String(raw ?? '')
    .trim()
    .replace(/^@+/, '')
    .replace(/^https?:\/\/(t\.me|telegram\.me)\//i, '')
    .trim();
}