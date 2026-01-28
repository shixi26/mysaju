'use client';

import { getYear } from 'date-fns';
import {
  TEN_GAN,
  TWELVE_JI,
  TEN_GAN_NAMES,
  TWELVE_JI_NAMES,
  GAN_ELEMENTS,
  ELEMENT_GENERATES,
  ELEMENT_OVERCOMES,
  ElementType,
} from '../constants/ganji';
import { calculateSib } from './sibCalculator';
import type { SajuResult } from './calculator';
import { YEAR_FORTUNE_BY_SIB } from '../constants/yearFortune';
import type { SibType } from '../constants/ganji';

const BASE_YEAR = 1984;
const BASE_GAN = 0;
const BASE_JI = 0;

function calculateYearGan(year: number): number {
  const diff = year - BASE_YEAR;
  return ((BASE_GAN + diff) % 10 + 10) % 10;
}

function calculateYearJi(year: number): number {
  const diff = year - BASE_YEAR;
  return ((BASE_JI + diff) % 12 + 12) % 12;
}

export type YearRelationType = '생' | '극' | '비겁';

export interface YearFortuneResult {
  year: number;
  yearGan: string;
  yearJi: string;
  yearGanName: string;
  yearJiName: string;
  yearElement: ElementType;
  yearSib: SibType;
  relationType: YearRelationType;
  relationDetail: string;
  fortune: {
    wealth: string;
    relationship: string;
    career: string;
    health: string;
  };
}

function getRelationType(
  dayElement: ElementType,
  yearElement: ElementType
): { type: YearRelationType; detail: string } {
  if (dayElement === yearElement) {
    return { type: '비겁', detail: '올해 년운과 같은 오행으로, 동류의 기운이 모이는 해입니다.' };
  }
  if (ELEMENT_GENERATES[yearElement] === dayElement) {
    return { type: '생', detail: '올해 년운이 일간을 생해 주는 상생 관계로, 전반적으로 유리한 해입니다.' };
  }
  if (ELEMENT_GENERATES[dayElement] === yearElement) {
    return { type: '생', detail: '일간이 올해 년운을 생해 주는 관계로, 적극적으로 나서면 결실을 볼 수 있습니다.' };
  }
  if (ELEMENT_OVERCOMES[yearElement] === dayElement) {
    return { type: '극', detail: '올해 년운이 일간을 극하는 관계로, 스트레스나 제약이 있을 수 있어 조심하는 것이 좋습니다.' };
  }
  if (ELEMENT_OVERCOMES[dayElement] === yearElement) {
    return { type: '극', detail: '일간이 올해 년운을 극하는 극재 관계로, 재물·기회에 유리할 수 있으나 무리하지 마세요.' };
  }
  return { type: '비겁', detail: '올해 년운과 일간의 오행 관계가 중립에 가깝습니다.' };
}

/**
 * 올해(세운) 운세 분석
 * 현재 연도의 년주와 사주의 일간 관계를 바탕으로 올해 운세를 산출합니다.
 */
export function analyzeYearFortune(saju: SajuResult): YearFortuneResult {
  const year = getYear(new Date());
  const ganIndex = calculateYearGan(year);
  const jiIndex = calculateYearJi(year);

  const yearGan = TEN_GAN[ganIndex];
  const yearJi = TWELVE_JI[jiIndex];
  const yearElement = GAN_ELEMENTS[ganIndex];

  const dayGanIndex = TEN_GAN.indexOf(saju.day.gan as (typeof TEN_GAN)[number]);
  const yearSib = calculateSib(dayGanIndex, ganIndex, null) as SibType;

  const dayElement = GAN_ELEMENTS[dayGanIndex];
  const { type: relationType, detail: relationDetail } = getRelationType(
    dayElement,
    yearElement
  );

  const baseFortune = YEAR_FORTUNE_BY_SIB[yearSib];
  const relationModifier = getRelationModifier(relationType, baseFortune);

  return {
    year,
    yearGan,
    yearJi,
    yearGanName: TEN_GAN_NAMES[ganIndex],
    yearJiName: TWELVE_JI_NAMES[jiIndex],
    yearElement,
    yearSib,
    relationType,
    relationDetail,
    fortune: {
      wealth: relationModifier.wealth ?? baseFortune.wealth,
      relationship: relationModifier.relationship ?? baseFortune.relationship,
      career: relationModifier.career ?? baseFortune.career,
      health: relationModifier.health ?? baseFortune.health,
    },
  };
}

function getRelationModifier(
  relationType: YearRelationType,
  base: { wealth: string; relationship: string; career: string; health: string }
): Partial<{ wealth: string; relationship: string; career: string; health: string }> {
  if (relationType === '생') {
    return {};
  }
  if (relationType === '극') {
    return {
      health: '올해는 년운과의 상극 관계로 몸과 마음의 피로가 쌓이기 쉬운 해입니다. 무리하지 말고 휴식을 충분히 취하세요.',
    };
  }
  return {};
}
