/**
 * Huy hiệu thương hiệu ở góc phải dưới.
 *
 * Khung "Powered by Netlify" do nơi lưu trữ web chèn vào và nằm ngoài phạm vi
 * code của trang (thường là iframe/shadow), nên không xoá được từ bên trong.
 * Cách chắc chắn nhất là đặt một tấm nền đục của mình đè lên đúng vùng đó,
 * vừa che khung cũ, vừa biến góc trang thành điểm nhận diện thương hiệu.
 */

const OVERLAY_Z = 2147483000;

export default function BrandCornerBadge() {
  return (
    <div
      aria-hidden="true"
      style={{ zIndex: OVERLAY_Z }}
      className="pointer-events-auto fixed bottom-0 right-0 flex h-[52px] w-[168px] items-center justify-end gap-2 rounded-tl-md border-l border-t hairline bg-background-100 px-4 sm:h-[56px] sm:w-[196px] sm:px-5"
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-md border border-primary-500/50 bg-primary-500/10 font-heading text-[10px] font-bold text-primary-500">
        Y
      </span>
      <div className="flex flex-col leading-none">
        <span className="font-heading text-[10px] font-bold tracking-[0.14em] text-foreground-900 whitespace-nowrap">
          TOOL AI YG88
        </span>
        <span className="mt-1 flex items-center gap-1 font-mono text-[8px] tracking-[0.16em] text-foreground-600 uppercase whitespace-nowrap">
          <span className="h-1 w-1 rounded-full bg-primary-500" />
          engine v3.2
        </span>
      </div>
    </div>
  );
}