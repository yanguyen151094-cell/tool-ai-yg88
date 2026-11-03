export type SlotStatus = 'hot' | 'stable' | 'cold';

export type SlotGame = {
  id: string;
  code: string;
  name: string;
  provider: string;
  providerKey: string;
  p: number;
  image: string;
  room: string;
  heat: number;
  confidence: number;
  payout: string;
  status: SlotStatus;
  players: number;
  updated: string;
};

export type BaccaratTable = {
  id: string;
  code: string;
  name: string;
  dealer: string;
  round: string;
  predict: 'BANKER' | 'PLAYER' | 'TIE';
  confidence: number;
  streak: string[];
  players: number;
  limit: string;
  image: string;
};

export const providerLabels: Record<string, string> = {
  pg: 'PG Soft',
  jl: 'Jili',
  fc: 'FaChai',
  pr: 'Pragmatic Play',
  cq: 'CQ9',
};

export const providerKeys = ['pg', 'jl', 'fc'] as const;

/** Ảnh dự phòng cho game mới thêm sau này (chưa có ảnh riêng). */
export const slotImages = [
  'https://readdy.ai/api/search-image?query=dark%20emerald%20mahjong%20slot%20game%20cover%20artwork%20with%20glowing%20jade%20tiles%20fanned%20out%2C%20golden%20dragon%20motifs%2C%20neon%20green%20rim%20light%2C%20deep%20black%20background%2C%20highly%20detailed%20digital%20casino%20illustration%2C%20no%20text&width=800&height=600&seq=gg66-fallback-01&orientation=landscape',
  'https://readdy.ai/api/search-image?query=luxury%20golden%20slot%20game%20cover%20artwork%20with%20stacked%20gold%20coins%2C%20red%20lanterns%20and%20glowing%20sparkles%20on%20deep%20black%20background%2C%20warm%20amber%20rim%20light%2C%20detailed%20digital%20casino%20illustration%2C%20no%20text&width=800&height=600&seq=gg66-fallback-02&orientation=landscape',
  'https://readdy.ai/api/search-image?query=royal%20purple%20casino%20slot%20game%20cover%20artwork%20with%20floating%20playing%20cards%2C%20gem%20stones%20and%20neon%20magenta%20glow%20on%20dark%20background%2C%20glossy%20three%20dimensional%20digital%20illustration%2C%20no%20text&width=800&height=600&seq=gg66-fallback-03&orientation=landscape',
];

export const baccaratImage =
  'https://readdy.ai/api/search-image?query=luxury%20baccarat%20table%20artwork%20with%20crystal%20card%20shoe%2C%20emerald%20green%20felt%20and%20gold%20trim%2C%20dark%20private%20room%20with%20soft%20spotlights%2C%20cinematic%20digital%20casino%20illustration%2C%20no%20text&width=800&height=600&seq=gg88-bac-diamond-01&orientation=landscape';

/** [code, name, providerKey, p, image] — danh sách game Nổ hũ đang mở. */
export const slotGamesSeed: [string, string, string, number, string][] = [
  ['PG002', 'Quyết Chiến Tiền Thưởng', 'pg', 84, 'https://static.readdy.ai/image/b107d501ab31adf698875488b112872d/30fce0b2b1caac6c7c0cc4054adbd2e5.png'],
  ['PG004', 'Kho Báu Aztec', 'pg', 76, 'https://static.readdy.ai/image/b107d501ab31adf698875488b112872d/e8028ebd15858f2804ca134fc8ab3d6d.png'],
  ['PG005', 'Đường Mạt Chược 1', 'pg', 90, 'https://static.readdy.ai/image/b107d501ab31adf698875488b112872d/d32d081efbac6e0c012f56f4ade2e66d.png'],
  ['PG003', 'Đường Mạt Chược 2', 'pg', 93, 'https://static.readdy.ai/image/b107d501ab31adf698875488b112872d/d90d7bd2fe7237432083071a27e8e0b5.png'],
  ['PG006', 'Mèo May Mắn', 'pg', 72, 'https://static.readdy.ai/image/b107d501ab31adf698875488b112872d/e4450a728d1e96e499cb5d0f3099510a.png'],
  ['PG007', 'Kỳ Lân Mách Nước', 'pg', 79, 'https://static.readdy.ai/image/b107d501ab31adf698875488b112872d/b01309e3dfdb3e8e73465ba149c7cbd0.png'],
  ['PG008', 'Cao Bồi Hoang Dã', 'pg', 74, 'https://static.readdy.ai/image/b107d501ab31adf698875488b112872d/76c49015e87b5f357d93b0a73e837bfb.png'],
  ['PG010', 'Thỏ May Mắn', 'pg', 82, 'https://static.readdy.ai/image/b107d501ab31adf698875488b112872d/6a09c4bd8b82110d7184c4817b3b2ab2.png'],
  ['PG012', 'Đêm Tiệc Cocktail', 'pg', 66, 'https://static.readdy.ai/image/b107d501ab31adf698875488b112872d/2c1430312a0069f542f7aa5290389fec.png'],
  ['JL001', 'Siêu Ace Deluxe', 'jl', 87, 'https://static.readdy.ai/image/b107d501ab31adf698875488b112872d/fb2ad2f8f63f31a3e7cd8d1eac95fead.png'],
  ['JL002', 'Đế Quốc Hoàng Kim', 'jl', 84, 'https://static.readdy.ai/image/b107d501ab31adf698875488b112872d/32a97856c7b8ed67e5ef9cfd53cddf81.png'],
  ['JL003', 'Ngọc May Mắn', 'jl', 91, 'https://static.readdy.ai/image/b107d501ab31adf698875488b112872d/002585c7bcb99c9a9b7edb646cff5f66.png'],
  ['JL004', 'Quyền Vương', 'jl', 78, 'https://static.readdy.ai/image/b107d501ab31adf698875488b112872d/813540715f23771b5f6f55b39b1fdda6.png'],
  ['JL005', 'Crazy777', 'jl', 89, 'https://static.readdy.ai/image/b107d501ab31adf698875488b112872d/a09cb5f47f6faecae24cc5436de9f658.png'],
  ['JL006', 'Kho Báu Rồng', 'jl', 82, 'https://static.readdy.ai/image/b107d501ab31adf698875488b112872d/9b730c86498318940721b47dea90247e.png'],
  ['JL007', 'Ali Baba', 'jl', 80, 'https://static.readdy.ai/image/b107d501ab31adf698875488b112872d/bde0c154dd9ef9f83ff34101812e50ca.png'],
  ['JL008', 'Cây Tài Lộc', 'jl', 86, 'https://static.readdy.ai/image/b107d501ab31adf698875488b112872d/528c913e7f4862bffb476b5cddd70b4f.png'],
  ['FC002', 'Tết Nguyên Đán More Ways', 'fc', 83, 'https://static.readdy.ai/image/b107d501ab31adf698875488b112872d/c86f6c60d694386d1558eb2e8343565c.png'],
  ['FC004', 'Cuối Năm', 'fc', 81, 'https://static.readdy.ai/image/b107d501ab31adf698875488b112872d/ac3a8e585048d95010a9aa040bdffdb6.png'],
  ['FC005', 'Kim Linh Thần Đèn', 'fc', 77, 'https://static.readdy.ai/image/b107d501ab31adf698875488b112872d/9404cf9605d9bc5b5ecfc9abbb93df69.png'],
  ['PG013', 'Khủng Hoảng Zombie', 'pg', 80, 'https://static.readdy.ai/image/b107d501ab31adf698875488b112872d/47399781d2276d42ed772a7c0e68b730.png'],
  ['PG014', 'Đá Quý Và Vàng', 'pg', 86, 'https://static.readdy.ai/image/b107d501ab31adf698875488b112872d/4d91349b706cec3f698120e9c3e72e4d.png'],
  ['PG015', 'Đại Tiệc Hoàng Cung', 'pg', 78, 'https://static.readdy.ai/image/b107d501ab31adf698875488b112872d/4d58ac2471cc2540f5912c0059b17300.png'],
  ['FC006', 'Cuối Năm 2', 'fc', 85, 'https://static.readdy.ai/image/b107d501ab31adf698875488b112872d/9200998f8a846c9b23460060dd512a0f.png'],
  ['FC007', 'Dạo Chơi Phố Đêm 2', 'fc', 73, 'https://static.readdy.ai/image/b107d501ab31adf698875488b112872d/43c6155fbe9356dd104ab31583904e4e.png'],
];

/** [code, name, dealer, predict, confidence, limit] */
export const baccaratSeeds: [string, string, string, 'BANKER' | 'PLAYER' | 'TIE', number, string][] = [
  ['BC6001', 'Bàn Kim Cương 01', 'Dealer Linh', 'BANKER', 97, '50K - 20M'],
  ['BC6002', 'Bàn Hoàng Gia 02', 'Dealer Vy', 'PLAYER', 94, '100K - 50M'],
  ['BC6003', 'Bàn Speed 03', 'Dealer Huy', 'BANKER', 91, '20K - 10M'],
  ['BC6004', 'Bàn Rồng Đỏ 04', 'Dealer My', 'PLAYER', 88, '50K - 30M'],
  ['BC6005', 'Bàn VIP 05', 'Dealer Trang', 'TIE', 74, '200K - 100M'],
  ['BC6006', 'Bàn Nhanh 06', 'Dealer Khoa', 'BANKER', 85, '20K - 15M'],
  ['BC6007', 'Bàn Pha Lê 07', 'Dealer Nhung', 'PLAYER', 83, '50K - 25M'],
  ['BC6008', 'Bàn Bạch Kim 08', 'Dealer Tú', 'BANKER', 90, '100K - 40M'],
  ['BC6009', 'Bàn Hổ Vàng 09', 'Dealer Sơn', 'PLAYER', 87, '50K - 20M'],
  ['BC6010', 'Bàn Long Phụng 10', 'Dealer Hà', 'BANKER', 92, '150K - 80M'],
  ['BC6011', 'Bàn Đế Vương 11', 'Dealer Phúc', 'BANKER', 89, '200K - 90M'],
  ['BC6012', 'Bàn Ánh Sao 12', 'Dealer Mai', 'PLAYER', 81, '30K - 12M'],
  ['BC6013', 'Bàn Hồng Ngọc 13', 'Dealer Yến', 'PLAYER', 79, '40K - 18M'],
  ['BC6014', 'Bàn Kim Long 14', 'Dealer Bình', 'BANKER', 86, '60K - 22M'],
  ['BC6015', 'Bàn Tốc Độ 15', 'Dealer An', 'TIE', 71, '20K - 8M'],
  ['BC6016', 'Bàn Thượng Lưu 16', 'Dealer Quyên', 'BANKER', 88, '250K - 120M'],
  ['BC6017', 'Bàn Ngọc Bích 17', 'Dealer Thảo', 'PLAYER', 84, '50K - 26M'],
  ['BC6018', 'Bàn Bão Tố 18', 'Dealer Dũng', 'BANKER', 77, '25K - 10M'],
  ['BC6019', 'Bàn Vàng Son 19', 'Dealer Nga', 'PLAYER', 82, '70K - 35M'],
  ['BC6020', 'Bàn Bình Minh 20', 'Dealer Kiên', 'BANKER', 80, '30K - 14M'],
  ['BC6021', 'Bàn Hoàng Kim 21', 'Dealer Loan', 'PLAYER', 91, '300K - 150M'],
  ['BC6022', 'Bàn Lửa Đỏ 22', 'Dealer Hải', 'BANKER', 75, '25K - 9M'],
  ['BC6023', 'Bàn Sương Mai 23', 'Dealer Trâm', 'PLAYER', 78, '40K - 16M'],
  ['BC6024', 'Bàn Thiên Long 24', 'Dealer Vũ', 'BANKER', 87, '100K - 45M'],
  ['BC6025', 'Bàn Cát Tường 25', 'Dealer Hạnh', 'BANKER', 85, '60K - 24M'],
  ['BC6026', 'Bàn Phú Quý 26', 'Dealer Tâm', 'PLAYER', 83, '80K - 32M'],
  ['BC6027', 'Bàn Tia Chớp 27', 'Dealer Long', 'TIE', 69, '20K - 7M'],
  ['BC6028', 'Bàn Đại Phát 28', 'Dealer Oanh', 'BANKER', 90, '200K - 95M'],
  ['BC6029', 'Bàn Bát Tiên 29', 'Dealer Hòa', 'PLAYER', 86, '90K - 40M'],
  ['BC6030', 'Bàn Vô Song 30', 'Dealer Nam', 'BANKER', 93, '350K - 180M'],
  ['BC6031', 'Bàn Thần Tài 31', 'Dealer Phượng', 'PLAYER', 82, '50K - 21M'],
  ['BC6032', 'Bàn Tinh Tú 32', 'Dealer Đạt', 'BANKER', 76, '30K - 11M'],
  ['BC6033', 'Bàn Lam Ngọc 33', 'Dealer Hường', 'PLAYER', 84, '70K - 30M'],
  ['BC6034', 'Bàn Dạ Quang 34', 'Dealer Thịnh', 'BANKER', 79, '45K - 19M'],
  ['BC6035', 'Bàn Trường Thọ 35', 'Dealer Cẩm', 'PLAYER', 88, '120K - 55M'],
  ['BC6036', 'Bàn Kiêu Sa 36', 'Dealer Vân', 'BANKER', 81, '55K - 23M'],
  ['BC6037', 'Bàn Châu Báu 37', 'Dealer Toàn', 'PLAYER', 77, '35K - 13M'],
];

export const aiStatus = {
  model: 'yg88-net v3.2',
  latency: '23ms',
  streams: '1.247',
  confidence: '94%',
  online: '2.642',
};