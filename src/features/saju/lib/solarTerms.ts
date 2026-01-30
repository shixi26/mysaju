/**
 * 節氣(절기) 기반 年柱·月柱 계산
 * 年柱: 立春(입춘) 기준
 * 月柱: 節氣 구간별 寅月~丑月
 * 연도별 정확한 절기 날짜는 JSON 데이터 또는 API 응답 사용
 */

import solarTermsData from '../data/solarTerms.json';
import type { SolarTermsYearData } from './fetchSolarTerms';

/** 절기 시작일 가져오기 (override 있으면 우선, 없으면 JSON, 없으면 근사값) */
function getSolarTermDate(
  year: number,
  termKey: string,
  override?: Record<number, SolarTermsYearData> | null
): { m: number; d: number } {
  const yearOverride = override?.[year];
  if (yearOverride?.[termKey]) {
    return { m: yearOverride[termKey].month, d: yearOverride[termKey].day };
  }
  const yearData = (solarTermsData as Record<string, unknown>)[String(year)] as
    | Record<string, { month: number; day: number }>
    | undefined;
  if (yearData?.[termKey]) {
    return { m: yearData[termKey].month, d: yearData[termKey].day };
  }
  // 폴백: 근사값
  const defaults: Record<string, { m: number; d: number }> = {
    xiaohan: { m: 1, d: 6 },
    lichun: { m: 2, d: 4 },
    jingzhe: { m: 3, d: 6 },
    qingming: { m: 4, d: 5 },
    lixia: { m: 5, d: 6 },
    mangzhong: { m: 6, d: 6 },
    xiaoshu: { m: 7, d: 7 },
    liqiu: { m: 8, d: 8 },
    bailu: { m: 9, d: 8 },
    hanlu: { m: 10, d: 8 },
    lidong: { m: 11, d: 8 },
    daxue: { m: 12, d: 7 },
  };
  return defaults[termKey] || { m: 1, d: 1 };
}

function before(m: number, d: number, M: number, D: number): boolean {
  return m < M || (m === M && d < D);
}

function onOrAfter(m: number, d: number, M: number, D: number): boolean {
  return m > M || (m === M && d >= D);
}

/**
 * 절기 기준 節氣月(1=寅月 … 12=丑月) 반환
 */
function getSolarMonth(
  year: number,
  m: number,
  d: number,
  override?: Record<number, SolarTermsYearData> | null
): number {
  const LICHUN = getSolarTermDate(year, 'lichun', override);
  const JINGZHE = getSolarTermDate(year, 'jingzhe', override);
  const QINGMING = getSolarTermDate(year, 'qingming', override);
  const LIXIA = getSolarTermDate(year, 'lixia', override);
  const MANGZHONG = getSolarTermDate(year, 'mangzhong', override);
  const XIAOSHU = getSolarTermDate(year, 'xiaoshu', override);
  const LIQIU = getSolarTermDate(year, 'liqiu', override);
  const BAILU = getSolarTermDate(year, 'bailu', override);
  const HANLU = getSolarTermDate(year, 'hanlu', override);
  const LIDONG = getSolarTermDate(year, 'lidong', override);
  const DAXUE = getSolarTermDate(year, 'daxue', override);
  const XIAOHAN = getSolarTermDate(year, 'xiaohan', override);

  if (m === 12 && d >= DAXUE.d) return 11; // 子月 大雪~小寒 전
  if (m === 1 && before(m, d, XIAOHAN.m, XIAOHAN.d)) return 11;
  if (onOrAfter(m, d, XIAOHAN.m, XIAOHAN.d) && before(m, d, LICHUN.m, LICHUN.d)) return 12; // 丑月
  if (onOrAfter(m, d, LICHUN.m, LICHUN.d) && before(m, d, JINGZHE.m, JINGZHE.d)) return 1;
  if (onOrAfter(m, d, JINGZHE.m, JINGZHE.d) && before(m, d, QINGMING.m, QINGMING.d)) return 2;
  if (onOrAfter(m, d, QINGMING.m, QINGMING.d) && before(m, d, LIXIA.m, LIXIA.d)) return 3;
  if (onOrAfter(m, d, LIXIA.m, LIXIA.d) && before(m, d, MANGZHONG.m, MANGZHONG.d)) return 4;
  if (onOrAfter(m, d, MANGZHONG.m, MANGZHONG.d) && before(m, d, XIAOSHU.m, XIAOSHU.d)) return 5;
  if (onOrAfter(m, d, XIAOSHU.m, XIAOSHU.d) && before(m, d, LIQIU.m, LIQIU.d)) return 6;
  if (onOrAfter(m, d, LIQIU.m, LIQIU.d) && before(m, d, BAILU.m, BAILU.d)) return 7;
  if (onOrAfter(m, d, BAILU.m, BAILU.d) && before(m, d, HANLU.m, HANLU.d)) return 8;
  if (onOrAfter(m, d, HANLU.m, HANLU.d) && before(m, d, LIDONG.m, LIDONG.d)) return 9;
  if (onOrAfter(m, d, LIDONG.m, LIDONG.d) && before(m, d, DAXUE.m, DAXUE.d)) return 10;
  return 11;
}

/**
 * 절기 기준 年·月 반환
 * - 年: 立春 이전이면 전년도 干支
 * - 月: 節氣 구간별 1(寅月)~12(丑月)
 * @param override API에서 받은 연도별 24절기 데이터 (선택)
 */
export function getSolarYearMonth(
  year: number,
  month: number,
  day: number,
  override?: Record<number, SolarTermsYearData> | null
): { solarYear: number; solarMonth: number } {
  const LICHUN = getSolarTermDate(year, 'lichun', override);
  const beforeLichun = before(month, day, LICHUN.m, LICHUN.d);
  const solarYear = beforeLichun ? year - 1 : year;
  const solarMonth = getSolarMonth(year, month, day, override);
  return { solarYear, solarMonth };
}
