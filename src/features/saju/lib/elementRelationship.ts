import { ElementType, ELEMENT_GENERATES, ELEMENT_OVERCOMES } from '../constants/ganji';

export interface ElementRelationship {
  self: ElementType;
  generates: ElementType; // 내가 낳는 것 (생)
  generatedBy: ElementType; // 나를 낳는 것 (생당)
  overcomes: ElementType; // 내가 극하는 것 (극)
  overcomeBy: ElementType; // 나를 극하는 것 (극당)
}

/**
 * 일간 기준 오행 관계 계산
 */
export function calculateElementRelationship(dayElement: ElementType): ElementRelationship {
  return {
    self: dayElement,
    generates: ELEMENT_GENERATES[dayElement], // 내가 낳는 것
    generatedBy: Object.entries(ELEMENT_GENERATES).find(
      ([, value]) => value === dayElement
    )?.[0] as ElementType, // 나를 낳는 것
    overcomes: ELEMENT_OVERCOMES[dayElement], // 내가 극하는 것
    overcomeBy: Object.entries(ELEMENT_OVERCOMES).find(
      ([, value]) => value === dayElement
    )?.[0] as ElementType, // 나를 극하는 것
  };
}
