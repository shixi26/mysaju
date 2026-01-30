/**
 * 음력 → 양력 변환 (한국천문연구원 기준)
 * korean-lunar-calendar 패키지 사용
 */

import KoreanLunarCalendar from 'korean-lunar-calendar';

export interface LunarToSolarResult {
  year: number;
  month: number;
  day: number;
}

/**
 * 음력 날짜를 양력으로 변환
 * @param lunarYear 음력 연도
 * @param lunarMonth 음력 월 (1-12)
 * @param lunarDay 음력 일 (1-30)
 * @param isIntercalation 윤달 여부
 * @returns 양력 날짜 또는 null (잘못된 입력 시)
 */
export function lunarToSolar(
  lunarYear: number,
  lunarMonth: number,
  lunarDay: number,
  isIntercalation: boolean = false
): LunarToSolarResult | null {
  try {
    const calendar = new KoreanLunarCalendar();
    const ok = calendar.setLunarDate(lunarYear, lunarMonth, lunarDay, isIntercalation);
    if (!ok) return null;
    const solar = calendar.getSolarCalendar();
    if (!solar?.year || !solar?.month || !solar?.day) return null;
    return {
      year: solar.year,
      month: solar.month,
      day: solar.day,
    };
  } catch {
    return null;
  }
}
