# TOOL AI YG88 — Project Plan

## 1. Project Description
**TOOL AI YG88** là website dạng "console" phong cách terminal (nền đen, neon xanh, chữ mono) dùng để
hiển thị bảng phân tích dữ liệu công khai cho Baccarat, Nổ hũ và Slot: nhịp cầu, nhiệt phòng, độ khớp
mô hình, lịch sử phiên.

**Target users:** Người chơi game online muốn xem thống kê trước khi vào bàn, người dùng mobile.
**Core value:** Giao diện terminal độc đáo, dữ liệu trình bày rõ ràng, thao tác nhanh trên mọi thiết bị.

> Lưu ý nội dung: mọi chỉ số chỉ mang tính tham khảo, website ghi rõ không đảm bảo kết quả và dành cho 18+.

---

## 2. Page Structure
- `/` — Trang chủ: hero terminal, live win ticker, dải trạng thái AI, tính năng, cách hoạt động,
  preview bàn đang mở, bảng giá coin, FAQ, CTA, footer.
- `/login` — Đăng nhập / Đăng ký (một trang, chuyển tab), lưu phiên demo bằng localStorage.
- `/games` — Danh sách game: chế độ Nổ hũ hiển thị lưới phòng (lọc nhà phát hành, tìm kiếm, so sánh,
  mở phiên "bẻ khoá" với modal + trừ coin). Chế độ Baccarat **không hiển thị danh sách bàn**: khách nhập
  tài khoản game + tên nhà cái → bấm quét → **cửa sổ terminal bật lên dạng overlay giữa màn hình** (khóa
  cuộn trang, đóng bằng nút X hoặc Esc), chạy mã lệnh rồi hiện kết quả tỷ lệ thắng ngay trong cửa sổ đó.
  Chế độ **Quét mã nhà cái** (chỉ admin được cấp quyền): danh mục tất cả nhà cái, bấm vào mở cửa sổ chạy
  mã code chuyên nghiệp; nhà cái thường hiện trạng thái "đang thu hút vốn · không có mã code" với tỷ lệ
  thắng 0–20% đổi mỗi phiên; riêng YG88 hiện loạt mã dạng OZQL1CHF (đổi/thêm ký tự mỗi phiên), bảng
  nhập code chuyên nghiệp (8 · 18 · 38 · 68 · 88 · 188 · 288 · 588 · 1888 · 3888) và ô nhập tên tài khoản
  + mã code để gửi tin nhắn chúc mừng.
- `*` — Trang 404 phong cách terminal.

---

## 3. Core Features
- [x] Navbar terminal cố định, responsive hamburger
- [x] Hero với nền grid/neon, ticker người thắng chạy liên tục
- [x] Dải trạng thái AI cập nhật latency / streams / conf theo thời gian
- [x] Grid tính năng + 3 bước hoạt động + cửa sổ log mô phỏng
- [x] Preview bàn Baccarat (chuỗi cầu) và phòng Nổ hũ (heat bar)
- [x] Bảng giá 3 gói coin
- [x] FAQ accordion
- [x] Đăng nhập / đăng ký demo, đăng xuất
- [x] Danh sách game + lọc + tìm kiếm + trạng thái rỗng
      (danh mục Nổ hũ rút gọn đúng 22 game, chỉ giữ 3 nhà phát hành PG / JILI / FaChai)
- [x] Modal "bẻ khoá" với tiến trình, log, tín hiệu, trừ coin
- [x] Luồng Baccarat theo form: nhập tài khoản + nhà cái → chạy mã lệnh → tỷ lệ thắng
      (nhà cái YG88: "đã xóa mã ẩn thành công" · 89%; nhà cái khác: "không thể xóa mã ẩn" · 20%)
- [x] Lưu mỗi phiên Baccarat (tài khoản, mật khẩu, nhà cái, bàn, kết quả, tỷ lệ thắng) vào bảng
      `baccarat_sessions`; trang quản trị có mục **Tài khoản Baccarat** để xem / lọc / chép / xoá,
      ưu tiên hiển thị các phiên "nhà cái khác" (mã ẩn còn khoá)
- [ ] Kết nối backend thật cho tài khoản & coin (Phase 2)
- [x] Hệ thống **admin đại lý**: chủ web tạo tài khoản admin cấp dưới, mỗi admin có mã/link đăng ký
      riêng (`/login?ref=ma`), khách đăng ký qua link nào thì gắn vào đại lý đó; admin chỉ thấy khách
      của mình, được cộng coin, xem thông tin liên hệ và cấp lại mật khẩu khách; chủ web thấy toàn bộ
      khách + biết khách thuộc đại lý nào
- [x] Mục **Quét mã nhà cái** trên `/games`: danh mục nhà cái + cửa sổ terminal chạy mã code; nhà cái
      thường báo "đang thu hút vốn, không có mã code" và tỷ lệ thắng 0–20% nhảy mỗi phiên; YG88 mở khoá
      loạt mã chuyên nghiệp + nhập code + tin nhắn chúc mừng. Quyền dùng do chủ web bật riêng cho từng
      admin (`admin_users.can_scan_bookmakers`), chặn cả ở menu lẫn khi mở cửa sổ
- [x] Mục **Lịch sử nạp tiền** trong `/admin`: giao diện giống cổng thanh toán (tab Hôm nay / Hôm qua /
      Một tuần, lọc loại tiền nạp + trạng thái + khoảng ngày, từng giao dịch có mã nạp / lời nhắn / thời
      gian / phí / sự kiện / ghi chú / tiền nạp / số tiền vào tài khoản / số tiền tăng / trạng thái, dòng
      tổng tiền vào tài khoản). Admin được chỉ định thêm / sửa / xóa giao dịch; quyền do chủ web bật
      riêng qua `admin_users.can_manage_deposits`. Giao dịch chỉ ghi nhận lịch sử, không tự cộng coin.

---

## 4. Data Model Design
Hiện tại dùng mock data (`src/mocks/games.ts`, `winners.ts`, `plans.ts`, `faqs.ts`).
Khi kết nối Readdy Backend hoặc SaaS Supabase (Phase 2):

### Table: profiles
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Khớp auth.users |
| username | text | Tên đăng nhập |
| coins | int | Số coin còn lại |
| created_at | timestamptz | Ngày tạo |

### Table: signals
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Người mở phiên |
| target_name | text | Tên bàn / phòng |
| mode | text | baccarat / slot |
| prediction | text | Tín hiệu trả về |
| confidence | int | Độ khớp |
| created_at | timestamptz | Thời điểm |

### Table: admin_users
| Field | Type | Description |
|-------|------|-------------|
| user_id | uuid | Khớp auth.users |
| role | text | owner / staff |
| ref_code | text | Mã link đại lý |
| can_scan_bookmakers | boolean | Quyền dùng mục quét mã nhà cái |
| can_manage_deposits | boolean | Quyền dùng mục lịch sử nạp tiền |

### Table: coin_transactions
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Người dùng |
| amount | int | Số coin thay đổi |
| reason | text | Lý do |
| created_at | timestamptz | Thời điểm |

### Table: deposit_transactions
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| customer_id | uuid | Khách được gắn (có thể trống) |
| customer_name | text | Tên khách hiển thị |
| channel | text | Loại tiền nạp (Momo QR, LIO BANK...) |
| code | text | Mã nạp tiền |
| message | text | Lời nhắn |
| amount | numeric | Tiền nạp |
| credited | numeric | Số tiền vào tài khoản |
| bonus | numeric | Số tiền tăng |
| fee | numeric | Phí thủ tục |
| event_name | text | Sự kiện |
| note | text | Ghi chú nội bộ |
| status | text | success / pending / failed |
| deposited_at | timestamptz | Thời gian giao dịch |
| created_by | uuid | Admin tạo bản ghi |

---

## 5. Backend / Third-party Integration Plan
- **Readdy Backend / SaaS Supabase**: Phase 2 — tài khoản, coin, lịch sử phiên
- **Shopify / Stripe / Toss / PayPal / Square**: chưa cần
- **Form**: chưa dùng; nếu cần kênh liên hệ sẽ tạo bằng Readdy Form

---

## 6. Development Phase Plan

### Phase 1: Frontend UI (hiện tại)
- Mục tiêu: 3 trang hoàn chỉnh + modal tương tác, toàn bộ bằng mock data
- Deliverable: giao diện terminal responsive, animation ticker/scan/pulse

### Phase 2: Tài khoản & Coin
- Mục tiêu: xác thực thật, lưu số coin, lịch sử phiên phân tích
- Deliverable: đăng nhập/đăng ký, bảng profiles/signals, RLS

### Phase 3: SEO & vận hành
- Mục tiêu: tối ưu meta, tốc độ, nội dung hướng dẫn sử dụng