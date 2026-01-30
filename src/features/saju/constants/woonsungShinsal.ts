/**
 * 12운성(十二長生) · 12신살 상수 및 유틸
 */


/** 12운성 이름 (長生 → 養) */
export const WOONSUNG_NAMES = [
  '장생',
  '목욕',
  '관대',
  '건록',
  '제왕',
  '쇠',
  '병',
  '사',
  '묘',
  '절',
  '태',
  '양',
] as const;

/** 日干별 長生 地支 index (0=子 … 11=亥) */
export const CHANGSAENG_JI: Record<number, number> = {
  0: 11, // 甲 長生 亥
  1: 6,  // 乙 長生 午
  2: 2,  // 丙 長生 寅
  3: 9,  // 丁 長生 酉
  4: 2,  // 戊 長生 寅
  5: 9,  // 己 長生 酉
  6: 5,  // 庚 長生 巳
  7: 0,  // 辛 長生 子
  8: 8,  // 壬 長生 申
  9: 3,  // 癸 長生 卯
};

/**
 * 日干 + 地支 → 12운성 index (0~11)
 */
export function getWoonsungIndex(dayGanIndex: number, jiIndex: number): number {
  const start = CHANGSAENG_JI[dayGanIndex] ?? 0;
  return ((jiIndex - start) % 12 + 12) % 12;
}

/** 地支 index → 12신살 (桃花=子卯午酉→년살, 申·亥→망신살, 午→재살 等) */
export const SHINSAL_BY_JI: Record<number, string> = {
  0: '년살',    // 子 桃花
  1: '재살',    // 丑
  2: '재살',    // 寅
  3: '년살',    // 卯 桃花
  4: '재살',    // 辰
  5: '재살',    // 巳
  6: '재살',    // 午
  7: '재살',    // 未
  8: '망신살',  // 申
  9: '년살',    // 酉 桃花
  10: '재살',   // 戌
  11: '망신살', // 亥
};

export function getShinsal(jiIndex: number): string {
  return SHINSAL_BY_JI[jiIndex] ?? '재살';
}
