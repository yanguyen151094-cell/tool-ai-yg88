import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { DEPOSIT_FALLBACK_PATH } from '@/lib/deposit';

type Props = {
  url: string;
  className?: string;
  children: ReactNode;
};

/**
 * Nút nạp tiền: có link đại lý thì mở tab mới, chưa có thì dẫn về bảng giá.
 * Dùng thẻ a/Link thật để trình duyệt và SEO đều hiểu được.
 */
export default function DepositAction({ url, className, children }: Props) {
  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link to={DEPOSIT_FALLBACK_PATH} className={className}>
      {children}
    </Link>
  );
}