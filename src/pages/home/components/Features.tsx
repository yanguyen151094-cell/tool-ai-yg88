const features = [
  {
    icon: 'ri-radar-line',
    label: 'realtime',
    title: 'Dự đoán từng vòng',
    desc: 'Luồng kết quả được đọc liên tục, mô hình cập nhật lại nhịp cầu sau mỗi ván với độ trễ trung bình 23ms.',
  },
  {
    icon: 'ri-layout-grid-line',
    label: 'baccarat',
    title: 'Bảng cầu Baccarat',
    desc: 'Theo dõi chuỗi Banker / Player / Tie, cảnh báo cầu gãy và vùng nhiễu bất thường theo từng bàn.',
  },
  {
    icon: 'ri-coin-line',
    label: 'nổ hũ',
    title: 'Nhiệt phòng nổ hũ',
    desc: 'Chỉ số heat cho biết phòng đang tích luỹ hay đã xả, kèm biên dao động của từng mức cược.',
  },
  {
    icon: 'ri-line-chart-line',
    label: 'history',
    title: 'Lịch sử phiên',
    desc: 'Lưu lại toàn bộ tín hiệu đã phát, đối chiếu kết quả thực tế để bạn tự đánh giá độ hiệu quả.',
  },
  {
    icon: 'ri-shield-keyhole-line',
    label: 'security',
    title: 'Phiên mã hoá',
    desc: 'Kết nối SSL 1.3, mật khẩu băm một chiều, không lưu thông tin tài khoản game hay số dư của bạn.',
  },
  {
    icon: 'ri-device-line',
    label: 'multi',
    title: 'Chạy trên mọi thiết bị',
    desc: 'Không cần cài đặt. Console hoạt động trên trình duyệt điện thoại, tablet và máy tính.',
  },
];

export default function Features() {
  return (
    <section className="relative border-t hairline bg-background-100/60 py-16 md:py-24" id="features">
      <div className="pointer-events-none absolute inset-0 dot-bg opacity-30" />
      <div className="relative mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-10">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-[11px] tracking-[0.22em] text-primary-500 uppercase">
              // tính năng
            </p>
            <h2 className="mt-3 max-w-xl font-heading text-2xl font-bold text-foreground-950 md:text-4xl">
              Một console, đủ dữ liệu để bạn tự đọc bàn
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-foreground-500">
            Không hứa hẹn thắng. Chúng tôi chỉ đưa dữ liệu, mẫu hình và mức độ khớp để bạn tự quyết
            định.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className="group relative overflow-hidden rounded-lg border hairline bg-background-50/70 p-5 transition-colors hover:border-primary-500/45 md:p-6"
            >
              <span className="absolute right-4 top-4 font-mono text-[10px] text-foreground-700">
                0{index + 1}
              </span>
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md border border-primary-500/30 bg-primary-500/10 text-primary-500">
                <i className={`${feature.icon} text-xl`} />
              </div>
              <p className="font-mono text-[10px] tracking-[0.18em] text-primary-500 uppercase">
                {feature.label}
              </p>
              <h3 className="mt-2 font-heading text-base font-semibold text-foreground-950 md:text-lg">
                {feature.title}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-foreground-500">{feature.desc}</p>
              <div className="mt-5 h-px w-full bg-gradient-to-r from-primary-500/40 to-transparent" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}