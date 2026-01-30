/**
 * 만세력 계산기
 * - 년주: 입춘(立春) 기준
 * - 월주: 절기(節氣) 기준 (12節)
 * - 일주: 1900년 1월 31일 = 甲子日 기준
 * - 시주: 자시(子時) 23:30 시작, 일간 기준 시간 계산
 * - 자시(23:30~01:29) 중 23:30~23:59는 다음날 일주 기준
 */

import {
  TEN_GAN,
  TWELVE_JI,
  TEN_GAN_NAMES,
  TWELVE_JI_NAMES,
  GAN_ELEMENTS,
  JI_ELEMENTS,
  JI_HOURS,
  ElementType,
  SibType,
} from '../constants/ganji';
import { calculateAllSibs } from './sibCalculator';
import { getSolarYearMonth } from './solarTerms';
import type { SolarTermsYearData } from './fetchSolarTerms';

export interface SajuResult {
  year: { gan: string; ganName: string; ji: string; jiName: string; element: ElementType; ganSib: SibType; jiSib: SibType; jiHiddenSibs?: SibType[] };
  month: { gan: string; ganName: string; ji: string; jiName: string; element: ElementType; ganSib: SibType; jiSib: SibType; jiHiddenSibs?: SibType[] };
  day: { gan: string; ganName: string; ji: string; jiName: string; element: ElementType; ganSib: '일간'; jiSib: SibType; jiHiddenSibs?: SibType[] };
  hour: { gan: string; ganName: string; ji: string; jiName: string; element: ElementType; timeRange: string; ganSib: SibType; jiSib: SibType; jiHiddenSibs?: SibType[] } | null;
}

export interface ElementCount {
  목: number;
  화: number;
  토: number;
  금: number;
  수: number;
}

/**
 * 년간 계산 (1984년 = 甲子年 기준)
 */
function calculateYearGan(year: number): number {
  return ((year - 4) % 10 + 10) % 10;
}

/**
 * 년지 계산 (1984년 = 甲子年 기준)
 */
function calculateYearJi(year: number): number {
  return ((year - 4) % 12 + 12) % 12;
}

/**
 * 월간 계산 - 연간에 따른 월간 결정
 * 甲己年 → 丙寅月 시작 (월간2)
 * 乙庚年 → 戊寅月 시작 (월간4)
 * 丙辛年 → 庚寅月 시작 (월간6)
 * 丁壬年 → 壬寅月 시작 (월간8)
 * 戊癸年 → 甲寅月 시작 (월간0)
 */
function calculateMonthGan(yearGan: number, solarMonth: number): number {
  const monthGanStart = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0];
  return (monthGanStart[yearGan] + (solarMonth - 1)) % 10;
}

/**
 * 월지 계산 - 절기월에 따른 지지
 * 寅月(1)=寅(2), 卯月(2)=卯(3), ... 丑月(12)=丑(1)
 */
function calculateMonthJi(solarMonth: number): number {
  return (solarMonth + 1) % 12;
}

/**
 * 율리우스 일수(JD) 계산 - 정오 기준
 */
function toJulianDay(year: number, month: number, day: number): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + B - 1524.5;
}

/**
 * JD -> JDN(정수) 변환
 * - JD는 0.5 단위(정오 기준)라 날짜 경계 오차가 날 수 있음
 * - JDN(정수)로 바꿔서 날짜차를 안정적으로 계산
 */
function toJulianDayNumber(year: number, month: number, day: number): number {
  const jd = toJulianDay(year, month, day);
  return Math.floor(jd + 0.5); // JDN
}



/**
 * 일주 간지 계산 (60갑자 기반)
 * 기준: 2024년 1월 1일 = 甲子日 (검증된 기준)
 *
 * ✅ 핵심:
 * - diff로 60갑자 인덱스를 만든 뒤
 * - 그 인덱스에서 gan/ji를 같이 뽑아야 결합 규칙이 깨지지 않음
 */
function calculateDayGanZhi(year: number, month: number, day: number): { gan: number; ji: number } {
  // 2024-01-01 = 甲子日 (JDN 2460311)
  const BASE_JDN = 2460311;

  const jdn = toJulianDayNumber(year, month, day);
  const diff = jdn - BASE_JDN;

  const cycle60 = ((diff % 60) + 60) % 60; // 0..59, 0=甲子

  const gan = cycle60 % 10;  // 0=甲 ... 9=癸
  const ji = cycle60 % 12;   // 0=子 ... 11=亥

  return { gan, ji };
}


/**
 * 자시(子時) 여부 및 야자시 판단
 * 23:30~23:59 → 야자시(다음날 자시)
 */
function isLateNightZi(hour: number, minute: number): boolean {
  const totalMinutes = hour * 60 + minute;
  return totalMinutes >= 1410; // 23:30 = 1410분
}

/**
 * 시지(時支) 계산 - 자시 23:30 시작
 * 子時: 23:30~01:29 (0)
 * 丑時: 01:30~03:29 (1)
 * ...
 * 亥時: 21:30~23:29 (11)
 */
function calculateHourJi(hour: number, minute: number = 0): number {
  const totalMinutes = hour * 60 + minute;
  
  // 자시 23:30~01:29
  if (totalMinutes >= 1410 || totalMinutes < 90) return 0;
  // 축시 01:30~03:29
  if (totalMinutes < 210) return 1;
  // 인시 03:30~05:29
  if (totalMinutes < 330) return 2;
  // 묘시 05:30~07:29
  if (totalMinutes < 450) return 3;
  // 진시 07:30~09:29
  if (totalMinutes < 570) return 4;
  // 사시 09:30~11:29
  if (totalMinutes < 690) return 5;
  // 오시 11:30~13:29
  if (totalMinutes < 810) return 6;
  // 미시 13:30~15:29
  if (totalMinutes < 930) return 7;
  // 신시 15:30~17:29
  if (totalMinutes < 1050) return 8;
  // 유시 17:30~19:29
  if (totalMinutes < 1170) return 9;
  // 술시 19:30~21:29
  if (totalMinutes < 1290) return 10;
  // 해시 21:30~23:29
  return 11;
}

/**
 * 시간 계산 - 일간에 따른 시간 결정 (오자기두법)
 * 甲己日 → 甲子時 시작
 * 乙庚日 → 丙子時 시작
 * 丙辛日 → 戊子時 시작
 * 丁壬日 → 庚子時 시작
 * 戊癸日 → 壬子時 시작
 */
function calculateHourGan(dayGan: number, hourJi: number): number {
  const hourGanStart = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8];
  return (hourGanStart[dayGan] + hourJi) % 10;
}

/**
 * 사주팔자 계산 메인 함수
 * @param solarTermsOverride API에서 받은 연도별 24절기 데이터 (선택)
 */
export function calculateSaju(
  year: number,
  month: number,
  day: number,
  hour: number | null,
  minute: number = 0,
  solarTermsOverride?: Record<number, SolarTermsYearData> | null
): SajuResult {
  // 야자시(23:30~23:59)인 경우 다음날로 일주 계산
  let calcYear = year;
  let calcMonth = month;
  let calcDay = day;
  
  if (hour !== null && isLateNightZi(hour, minute)) {
    const nextDate = new Date(Date.UTC(year, month - 1, day));
    nextDate.setUTCDate(nextDate.getUTCDate() + 1);
    calcYear = nextDate.getUTCFullYear();
    calcMonth = nextDate.getUTCMonth() + 1;
    calcDay = nextDate.getUTCDate();    
  }

  // 절기 기준 년월 계산 (API 데이터 있으면 사용)
  const { solarYear, solarMonth } = getSolarYearMonth(
    year,
    month,
    day,
    solarTermsOverride
  );
  
  // 년주 계산
  const yearGanIndex = calculateYearGan(solarYear);
  const yearJiIndex = calculateYearJi(solarYear);
  
  // 월주 계산
  const monthGanIndex = calculateMonthGan(yearGanIndex, solarMonth);
  const monthJiIndex = calculateMonthJi(solarMonth);
  
  // 일주 계산 (야자시 보정된 날짜 사용)
  const { gan: dayGanIndex, ji: dayJiIndex } = calculateDayGanZhi(calcYear, calcMonth, calcDay);

  const yearGan = TEN_GAN[yearGanIndex];
  const yearJi = TWELVE_JI[yearJiIndex];
  const monthGan = TEN_GAN[monthGanIndex];
  const monthJi = TWELVE_JI[monthJiIndex];
  const dayGan = TEN_GAN[dayGanIndex];
  const dayJi = TWELVE_JI[dayJiIndex];

  let hourData: SajuResult['hour'] = null;
  let sibs: ReturnType<typeof calculateAllSibs>;

  if (hour !== null) {
    const hourJiIndex = calculateHourJi(hour, minute);
    const hourGanIndex = calculateHourGan(dayGanIndex, hourJiIndex);
    const hourGan = TEN_GAN[hourGanIndex];
    const hourJi = TWELVE_JI[hourJiIndex];

    sibs = calculateAllSibs(
      dayGanIndex,
      yearGan,
      yearJi,
      monthGan,
      monthJi,
      dayGan,
      dayJi,
      hourGan,
      hourJi
    );

    hourData = {
      gan: hourGan,
      ganName: TEN_GAN_NAMES[hourGanIndex],
      ji: hourJi,
      jiName: TWELVE_JI_NAMES[hourJiIndex],
      element: GAN_ELEMENTS[hourGanIndex],
      timeRange: JI_HOURS[hourJiIndex],
      ganSib: sibs.hour.gan as SibType,
      jiSib: sibs.hour.ji,
      jiHiddenSibs: sibs.hour.jiHidden,
    };
  } else {
    sibs = calculateAllSibs(
      dayGanIndex,
      yearGan,
      yearJi,
      monthGan,
      monthJi,
      dayGan,
      dayJi,
      '',
      ''
    );
  }

  return {
    year: {
      gan: yearGan,
      ganName: TEN_GAN_NAMES[yearGanIndex],
      ji: yearJi,
      jiName: TWELVE_JI_NAMES[yearJiIndex],
      element: GAN_ELEMENTS[yearGanIndex],
      ganSib: sibs.year.gan,
      jiSib: sibs.year.ji,
      jiHiddenSibs: sibs.year.jiHidden,
    },
    month: {
      gan: monthGan,
      ganName: TEN_GAN_NAMES[monthGanIndex],
      ji: monthJi,
      jiName: TWELVE_JI_NAMES[monthJiIndex],
      element: GAN_ELEMENTS[monthGanIndex],
      ganSib: sibs.month.gan,
      jiSib: sibs.month.ji,
      jiHiddenSibs: sibs.month.jiHidden,
    },
    day: {
      gan: dayGan,
      ganName: TEN_GAN_NAMES[dayGanIndex],
      ji: dayJi,
      jiName: TWELVE_JI_NAMES[dayJiIndex],
      element: GAN_ELEMENTS[dayGanIndex],
      ganSib: '일간',
      jiSib: sibs.day.ji,
      jiHiddenSibs: sibs.day.jiHidden,
    },
    hour: hourData,
  };
}

/**
 * 오행 개수 계산
 */
export function calculateElementCount(saju: SajuResult): ElementCount {
  const count: ElementCount = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };

  const inc = (g: string, j: string) => {
    const ganIdx = TEN_GAN.indexOf(g as (typeof TEN_GAN)[number]);
    const jiIdx = TWELVE_JI.indexOf(j as (typeof TWELVE_JI)[number]);
    if (ganIdx >= 0) count[GAN_ELEMENTS[ganIdx]]++;
    if (jiIdx >= 0) count[JI_ELEMENTS[jiIdx]]++;
  };

  inc(saju.year.gan, saju.year.ji);
  inc(saju.month.gan, saju.month.ji);
  inc(saju.day.gan, saju.day.ji);
  if (saju.hour) inc(saju.hour.gan, saju.hour.ji);

  return count;
}
