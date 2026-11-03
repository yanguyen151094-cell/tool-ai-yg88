import TermWindow from '@/components/base/TermWindow';

const steps = [
  {
    step: '01',
    title: 'Tạo tài khoản',
    desc: 'Chỉ cần tên đăng nhập và mật khẩu. Không cần liên kết tài khoản game, không cần nạp tiền vào console.',
  },
  {
    step: '02',
    title: 'Chọn chế độ',
    desc: 'Chuyển giữa Baccarat và Nổ hũ / Slot. Bộ lọc nhà phát hành giúp bạn chỉ xem phòng đang chơi.',
  },
  {
    step: '03',
    title: 'Đọc tín hiệu',
    desc: 'Bấm "Bẻ khoá" để mở phiên phân tích. Console trả về nhịp cầu, độ khớp và mức độ rủi ro của vòng kế tiếp.',
  },
];

const logs = [
  { text: 'init session → yg88-net v3.2', tone: 'muted' },
  { text: 'load stream: baccarat#48192', tone: 'muted' },
  { text: 'pattern: 3-2-1 zigzag · conf 0.97', tone: 'primary' },
  { text: 'signal → BANKER', tone: 'accent' },
  { text: 'risk buffer: 0.12 · safe zone', tone: 'muted' },
  { text: 'ready. awaiting next round…', tone: 'primary' },
];

export default function HowItWorks() {
  return (
    <section className="relative border-t hairline py-16 md:py-24" id="how">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <p className="font-mono text-[11px] tracking-[0.22em] text-primary-500 uppercase">
              // cách hoạt động
            </p>
            <h2 className="mt-3 font-heading text-2xl font-bold text-foreground-950 md:text-4xl">
              Ba bước, không cần cấu hình gì
            </h2>
            <div className="mt-8 space-y-6">
              {steps.map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-primary-500/30 bg-background-100 font-mono text-[11px] font-bold text-primary-500">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-semibold text-foreground-950">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-foreground-500">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            <TermWindow title="yg88@console — session" bodyClassName="p-4 md:p-5">
              <div className="scanlines pointer-events-none absolute inset-0" />
              <div className="space-y-2 font-mono text-[11px] leading-relaxed md:text-[12px]">
                {logs.map((log) => (
                  <p
                    key={log.text}
                    className={
                      log.tone === 'primary'
                        ? 'text-primary-500'
                        : log.tone === 'accent'
                          ? 'text-accent-500'
                          : 'text-foreground-500'
                    }
                  >
                    <span className="mr-2 text-foreground-700">$</span>
                    {log.text}
                  </p>
                ))}
                <p className="caret text-foreground-300" />
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { k: 'độ khớp', v: '97%' },
                  { k: 'rủi ro', v: '0.12' },
                  { k: 'vòng', v: '#4819x' },
                ].map((metric) => (
                  <div
                    key={metric.k}
                    className="rounded border border-primary-500/20 bg-background-100/70 px-3 py-2"
                  >
                    <p className="font-mono text-[10px] tracking-[0.14em] text-foreground-600 uppercase">
                      {metric.k}
                    </p>
                    <p className="mt-1 font-heading text-base font-bold text-foreground-950">
                      {metric.v}
                    </p>
                  </div>
                ))}
              </div>
            </TermWindow>

            <p className="mt-4 font-mono text-[10px] leading-relaxed text-foreground-600">
              * Console chỉ hiển thị thống kê từ dữ liệu công khai. Kết quả mỗi ván là ngẫu nhiên và
              không phụ thuộc vào tín hiệu.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}