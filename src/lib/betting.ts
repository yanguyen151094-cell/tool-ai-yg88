/** Các mức cược cố định (đơn vị K). Mức cược chỉ được nhảy đúng trong danh sách này. */
export const BET_LEVELS = [2, 4, 6, 8, 10, 12, 16, 20, 24, 28, 32, 40, 60, 100, 200] as const;

/** Mức cược cao nhất trong danh sách. */
export const MAX_BET_LEVEL = BET_LEVELS[BET_LEVELS.length - 1];

/** Lấy một mức cược theo chỉ số, tự quay vòng khi vượt quá danh sách. */
export const betLevelAt = (index: number) =>
  BET_LEVELS[((index % BET_LEVELS.length) + BET_LEVELS.length) % BET_LEVELS.length];

export const formatBetLevel = (level: number) => `${level.toLocaleString('vi-VN')}K`;