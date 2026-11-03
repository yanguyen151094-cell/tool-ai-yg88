export type CoinTier = {
  id: string;
  deposit: string;
  unit: string;
  xu: string;
  note: string;
  badge: string | null;
  wide: boolean;
};

export const coinTiers: CoinTier[] = [
  {
    id: 'tier-100',
    deposit: '100',
    unit: 'K',
    xu: '20',
    note: 'Bắt đầu làm quen bảng phân tích',
    badge: null,
    wide: false,
  },
  {
    id: 'tier-200',
    deposit: '200',
    unit: 'K',
    xu: '30',
    note: 'Theo dõi thêm nhiều bàn cùng lúc',
    badge: null,
    wide: false,
  },
  {
    id: 'tier-300',
    deposit: '300',
    unit: 'K',
    xu: '40',
    note: 'Đủ dùng cho vài ngày cao điểm',
    badge: null,
    wide: false,
  },
  {
    id: 'tier-500',
    deposit: '500',
    unit: 'K',
    xu: '70',
    note: 'Mức được chọn nhiều nhất',
    badge: 'Nhiều người chọn',
    wide: false,
  },
  {
    id: 'tier-1tr',
    deposit: '1',
    unit: 'TR',
    xu: '120',
    note: 'Xu nhiều nhất, dùng dài hạn',
    badge: 'Gói lớn nhất',
    wide: true,
  },
];