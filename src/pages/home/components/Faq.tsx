import { useState } from 'react';
import { faqs } from '@/mocks/faqs';

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative border-t hairline bg-background-100/60 py-16 md:py-24" id="faq">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-4">
            <p className="font-mono text-[11px] tracking-[0.22em] text-primary-500 uppercase">
              // hỏi đáp
            </p>
            <h2 className="mt-3 font-heading text-2xl font-bold text-foreground-950 md:text-4xl">
              Câu hỏi thường gặp
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground-500">
              Vẫn chưa rõ điều gì? Nhắn cho bộ phận hỗ trợ, thời gian phản hồi trung bình 5 - 15 phút.
            </p>
            <a
              href="#faq"
              className="mt-6 inline-flex items-center gap-2 rounded-md border border-primary-500/40 px-4 py-2 font-mono text-[12px] whitespace-nowrap text-foreground-200 transition-colors hover:border-primary-500/70 hover:text-primary-500"
            >
              <i className="ri-customer-service-2-line" />
              Liên hệ hỗ trợ
            </a>
          </div>

          <div className="lg:col-span-8">
            <div className="divide-y divide-primary-500/10 border-y border-primary-500/10">
              {faqs.map((item, index) => {
                const open = openIndex === index;
                return (
                  <div key={item.q}>
                    <button
                      type="button"
                      onClick={() => setOpenIndex(open ? null : index)}
                      className="flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left"
                      aria-expanded={open}
                    >
                      <span className="flex items-start gap-3">
                        <span className="mt-0.5 font-mono text-[11px] text-primary-500">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="font-heading text-sm font-semibold text-foreground-950 md:text-base">
                          {item.q}
                        </span>
                      </span>
                      <i
                        className={`shrink-0 text-base text-primary-500 transition-transform duration-200 ${
                          open ? 'ri-subtract-line' : 'ri-add-line'
                        }`}
                      />
                    </button>
                    <div
                      className={`grid overflow-hidden transition-all duration-300 ${
                        open ? 'grid-rows-[1fr] pb-5 opacity-100' : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <p className="min-h-0 pl-8 pr-6 text-[13px] leading-relaxed text-foreground-500">
                        {item.a}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}