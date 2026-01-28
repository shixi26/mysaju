import {
  TEN_GAN,
  TWELVE_JI,
  GAN_ELEMENTS,
  JI_ELEMENTS,
  JI_HIDDEN_GANS,
  ELEMENT_GENERATES,
  ELEMENT_OVERCOMES,
  SibType,
  ElementType,
} from '../constants/ganji';

/**
 * 간지의 음양 판단 (0,2,4,6,8 = 양, 1,3,5,7,9 = 음)
 */
function isYang(ganIndex: number): boolean {
  return ganIndex % 2 === 0;
}

/**
 * 지지의 음양 판단 (0,2,4,6,8,10 = 양, 1,3,5,7,9,11 = 음)
 */
function isJiYang(jiIndex: number): boolean {
  return jiIndex % 2 === 0;
}

/**
 * 십성 계산 (일간 기준)
 */
export function calculateSib(
  dayGanIndex: number,
  targetGanIndex: number | null,
  targetJiIndex: number | null
): SibType {
  const dayElement = GAN_ELEMENTS[dayGanIndex];
  const dayIsYang = isYang(dayGanIndex);

  // 간지(天干)의 십성 계산
  if (targetGanIndex !== null) {
    const targetElement = GAN_ELEMENTS[targetGanIndex];
    const targetIsYang = isYang(targetGanIndex);

    // 같은 오행
    if (dayElement === targetElement) {
      return dayIsYang === targetIsYang ? '비견' : '겁재';
    }

    // 내가 낳는 것 (생)
    if (ELEMENT_GENERATES[dayElement] === targetElement) {
      return dayIsYang === targetIsYang ? '식신' : '상관';
    }

    // 내가 극하는 것 (극)
    if (ELEMENT_OVERCOMES[dayElement] === targetElement) {
      return dayIsYang === targetIsYang ? '편재' : '정재';
    }

    // 나를 극하는 것 (극당)
    const overcomeBy = Object.entries(ELEMENT_OVERCOMES).find(
      ([, value]) => value === dayElement
    )?.[0] as ElementType | undefined;
    if (overcomeBy === targetElement) {
      return dayIsYang === targetIsYang ? '편관' : '정관';
    }

    // 나를 낳는 것 (생당)
    const generateBy = Object.entries(ELEMENT_GENERATES).find(
      ([, value]) => value === dayElement
    )?.[0] as ElementType | undefined;
    if (generateBy === targetElement) {
      return dayIsYang === targetIsYang ? '편인' : '정인';
    }
  }

  // 지지(地支)의 십성 계산
  if (targetJiIndex !== null) {
    const targetElement = JI_ELEMENTS[targetJiIndex];
    const targetIsYang = isJiYang(targetJiIndex);

    // 같은 오행
    if (dayElement === targetElement) {
      return dayIsYang === targetIsYang ? '비견' : '겁재';
    }

    // 내가 낳는 것 (생)
    if (ELEMENT_GENERATES[dayElement] === targetElement) {
      return dayIsYang === targetIsYang ? '식신' : '상관';
    }

    // 내가 극하는 것 (극)
    if (ELEMENT_OVERCOMES[dayElement] === targetElement) {
      return dayIsYang === targetIsYang ? '편재' : '정재';
    }

    // 나를 극하는 것 (극당)
    const overcomeBy = Object.entries(ELEMENT_OVERCOMES).find(
      ([, value]) => value === dayElement
    )?.[0] as ElementType | undefined;
    if (overcomeBy === targetElement) {
      return dayIsYang === targetIsYang ? '편관' : '정관';
    }

    // 나를 낳는 것 (생당)
    const generateBy = Object.entries(ELEMENT_GENERATES).find(
      ([, value]) => value === dayElement
    )?.[0] as ElementType | undefined;
    if (generateBy === targetElement) {
      return dayIsYang === targetIsYang ? '편인' : '정인';
    }
  }

  // 기본값 (발생하지 않아야 함)
  return '비견';
}

/**
 * 지지의 장간들을 모두 계산하여 십성 반환 (만세력)
 */
function calculateJiSibsWithHiddenGans(
  dayGanIndex: number,
  jiIndex: number
): SibType[] {
  const hiddenGans = JI_HIDDEN_GANS[jiIndex] || [];
  const sibs: SibType[] = [];

  // 지지 자체의 십성 (기존 방식)
  sibs.push(calculateSib(dayGanIndex, null, jiIndex));

  // 지지에 숨어있는 장간들의 십성
  hiddenGans.forEach((hiddenGanIndex) => {
    sibs.push(calculateSib(dayGanIndex, hiddenGanIndex, null));
  });

  return sibs;
}

/**
 * 사주팔자의 모든 십성 계산 (만세력 기준)
 */
export function calculateAllSibs(
  dayGanIndex: number,
  yearGan: string,
  yearJi: string,
  monthGan: string,
  monthJi: string,
  dayGan: string,
  dayJi: string,
  hourGan: string,
  hourJi: string
) {
  const yearGanIndex = TEN_GAN.indexOf(yearGan as (typeof TEN_GAN)[number]);
  const yearJiIndex = TWELVE_JI.indexOf(yearJi as (typeof TWELVE_JI)[number]);
  const monthGanIndex = TEN_GAN.indexOf(monthGan as (typeof TEN_GAN)[number]);
  const monthJiIndex = TWELVE_JI.indexOf(monthJi as (typeof TWELVE_JI)[number]);
  const dayJiIndex = TWELVE_JI.indexOf(dayJi as (typeof TWELVE_JI)[number]);

  // 만세력: 지지의 장간들도 모두 계산
  const yearJiSibs = calculateJiSibsWithHiddenGans(dayGanIndex, yearJiIndex);
  const monthJiSibs = calculateJiSibsWithHiddenGans(dayGanIndex, monthJiIndex);
  const dayJiSibs = calculateJiSibsWithHiddenGans(dayGanIndex, dayJiIndex);

  const baseResult = {
    year: {
      gan: calculateSib(dayGanIndex, yearGanIndex, null),
      ji: yearJiSibs[0], // 지지 자체의 십성 (주 십성)
      jiHidden: yearJiSibs.slice(1), // 장간들의 십성
    },
    month: {
      gan: calculateSib(dayGanIndex, monthGanIndex, null),
      ji: monthJiSibs[0],
      jiHidden: monthJiSibs.slice(1),
    },
    day: {
      gan: '일간' as const, // 일간은 자기 자신
      ji: dayJiSibs[0],
      jiHidden: dayJiSibs.slice(1),
    },
  };

  // 시주가 있는 경우에만 계산
  if (hourGan && hourJi) {
    const hourGanIndex = TEN_GAN.indexOf(hourGan as (typeof TEN_GAN)[number]);
    const hourJiIndex = TWELVE_JI.indexOf(hourJi as (typeof TWELVE_JI)[number]);
    const hourJiSibs = calculateJiSibsWithHiddenGans(dayGanIndex, hourJiIndex);

    return {
      ...baseResult,
      hour: {
        gan: calculateSib(dayGanIndex, hourGanIndex, null),
        ji: hourJiSibs[0],
        jiHidden: hourJiSibs.slice(1),
      },
    };
  }

  return {
    ...baseResult,
    hour: {
      gan: '일간' as const,
      ji: '비견' as SibType,
      jiHidden: [],
    },
  };
}
