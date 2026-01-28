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
 * 년간 계산
 * 1984년 기준: 갑자년
 */
function calculateYearGan(year: number): number {
  const baseYear = 1984; // 갑자년
  const baseGan = 0; // 갑
  const diff = year - baseYear;
  return ((baseGan + diff) % 10 + 10) % 10;
}

/**
 * 년지 계산
 */
function calculateYearJi(year: number): number {
  const baseYear = 1984; // 갑자년
  const baseJi = 0; // 자
  const diff = year - baseYear;
  return ((baseJi + diff) % 12 + 12) % 12;
}

/**
 * 월간 계산 (절기 기준)
 */
function calculateMonthGan(year: number, month: number): number {
  const yearGan = calculateYearGan(year);
  // 월간 계산 공식: (년간 * 2 + 월) % 10
  // 1월(인월)부터 시작
  const monthIndex = month - 1;
  return ((yearGan * 2 + monthIndex) % 10 + 10) % 10;
}

/**
 * 월지 계산
 */
function calculateMonthJi(month: number): number {
  // 1월 = 인(2), 2월 = 묘(3), ..., 12월 = 축(1)
  const monthJiMap: Record<number, number> = {
    1: 2, // 인
    2: 3, // 묘
    3: 4, // 진
    4: 5, // 사
    5: 6, // 오
    6: 7, // 미
    7: 8, // 신
    8: 9, // 유
    9: 10, // 술
    10: 11, // 해
    11: 0, // 자
    12: 1, // 축
  };
  return monthJiMap[month] ?? 2;
}

/**
 * 일간 계산 (1900년 1월 1일 = 갑진일 기준)
 */
function calculateDayGan(year: number, month: number, day: number): number {
  const date = new Date(year, month - 1, day);
  const baseDate = new Date(1900, 0, 1); // 1900년 1월 1일 = 갑진일
  const baseGan = 0; // 갑
  
  const diffTime = date.getTime() - baseDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return ((baseGan + diffDays) % 10 + 10) % 10;
}

/**
 * 일지 계산
 */
function calculateDayJi(year: number, month: number, day: number): number {
  const date = new Date(year, month - 1, day);
  const baseDate = new Date(1900, 0, 1); // 1900년 1월 1일 = 갑진일
  const baseJi = 4; // 진
  
  const diffTime = date.getTime() - baseDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return ((baseJi + diffDays) % 12 + 12) % 12;
}

/**
 * 시간에 따른 지지 계산
 */
function calculateHourJi(hour: number): number {
  // 23시-0시59분 = 자(0)
  // 1시-2시59분 = 축(1)
  // ...
  if (hour >= 23 || hour < 1) return 0; // 자
  if (hour >= 1 && hour < 3) return 1; // 축
  if (hour >= 3 && hour < 5) return 2; // 인
  if (hour >= 5 && hour < 7) return 3; // 묘
  if (hour >= 7 && hour < 9) return 4; // 진
  if (hour >= 9 && hour < 11) return 5; // 사
  if (hour >= 11 && hour < 13) return 6; // 오
  if (hour >= 13 && hour < 15) return 7; // 미
  if (hour >= 15 && hour < 17) return 8; // 신
  if (hour >= 17 && hour < 19) return 9; // 유
  if (hour >= 19 && hour < 21) return 10; // 술
  return 11; // 해
}

/**
 * 시간에 따른 간지 계산
 */
function calculateHourGan(dayGan: number, hourJi: number): number {
  // 일간에 따라 시간이 결정됨
  // 갑기일: 자시=갑, 을경일: 자시=병, 병신일: 자시=무, 정임일: 자시=경, 무계일: 자시=임
  const dayGanToHourGanMap: Record<number, number[]> = {
    0: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1], // 갑일: 자시=갑
    1: [2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3], // 을일: 자시=병
    2: [4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5], // 병일: 자시=무
    3: [6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7], // 정일: 자시=경
    4: [8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9], // 무일: 자시=임
    5: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1], // 기일: 자시=갑
    6: [2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3], // 경일: 자시=병
    7: [4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5], // 신일: 자시=무
    8: [6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7], // 임일: 자시=경
    9: [8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9], // 계일: 자시=임
  };
  
  return dayGanToHourGanMap[dayGan]?.[hourJi] ?? 0;
}

/**
 * 사주팔자 계산
 */
export function calculateSaju(
  year: number,
  month: number,
  day: number,
  hour: number | null
): SajuResult {
  const yearGanIndex = calculateYearGan(year);
  const yearJiIndex = calculateYearJi(year);
  const monthGanIndex = calculateMonthGan(year, month);
  const monthJiIndex = calculateMonthJi(month);
  const dayGanIndex = calculateDayGan(year, month, day);
  const dayJiIndex = calculateDayJi(year, month, day);

  const yearGan = TEN_GAN[yearGanIndex];
  const yearJi = TWELVE_JI[yearJiIndex];
  const monthGan = TEN_GAN[monthGanIndex];
  const monthJi = TWELVE_JI[monthJiIndex];
  const dayGan = TEN_GAN[dayGanIndex];
  const dayJi = TWELVE_JI[dayJiIndex];

  // 시주 계산 (시간을 모를 경우 null)
  let hourData: SajuResult['hour'] = null;
  let sibs: ReturnType<typeof calculateAllSibs>;

  if (hour !== null) {
    const hourJiIndex = calculateHourJi(hour);
    const hourGanIndex = calculateHourGan(dayGanIndex, hourJiIndex);
    const hourGan = TEN_GAN[hourGanIndex];
    const hourJi = TWELVE_JI[hourJiIndex];

    // 십성 계산 (시주 포함)
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
    // 십성 계산 (시주 제외)
    sibs = calculateAllSibs(
      dayGanIndex,
      yearGan,
      yearJi,
      monthGan,
      monthJi,
      dayGan,
      dayJi,
      '', // 빈 문자열로 처리
      '' // 빈 문자열로 처리
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
      ganSib: '일간' as const,
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
  const count: ElementCount = {
    목: 0,
    화: 0,
    토: 0,
    금: 0,
    수: 0,
  };

  // 년주
  count[GAN_ELEMENTS[TEN_GAN.indexOf(saju.year.gan)]]++;
  count[JI_ELEMENTS[TWELVE_JI.indexOf(saju.year.ji)]]++;

  // 월주
  count[GAN_ELEMENTS[TEN_GAN.indexOf(saju.month.gan)]]++;
  count[JI_ELEMENTS[TWELVE_JI.indexOf(saju.month.ji)]]++;

  // 일주
  count[GAN_ELEMENTS[TEN_GAN.indexOf(saju.day.gan)]]++;
  count[JI_ELEMENTS[TWELVE_JI.indexOf(saju.day.ji)]]++;

  // 시주 (있는 경우에만)
  if (saju.hour) {
    count[GAN_ELEMENTS[TEN_GAN.indexOf(saju.hour.gan)]]++;
    count[JI_ELEMENTS[TWELVE_JI.indexOf(saju.hour.ji)]]++;
  }

  return count;
}
