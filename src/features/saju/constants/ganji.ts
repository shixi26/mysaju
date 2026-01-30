// 십간 (天干)
export const TEN_GAN = [
  '甲', // 갑
  '乙', // 을
  '丙', // 병
  '丁', // 정
  '戊', // 무
  '己', // 기
  '庚', // 경
  '辛', // 신
  '壬', // 임
  '癸', // 계
] as const;

// 십이지 (地支)
export const TWELVE_JI = [
  '子', // 자
  '丑', // 축
  '寅', // 인
  '卯', // 묘
  '辰', // 진
  '巳', // 사
  '午', // 오
  '未', // 미
  '申', // 신
  '酉', // 유
  '戌', // 술
  '亥', // 해
] as const;

// 십간 한글명
export const TEN_GAN_NAMES = [
  '갑', '을', '병', '정', '무', '기', '경', '신', '임', '계',
] as const;

// 십이지 한글명
export const TWELVE_JI_NAMES = [
  '자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해',
] as const;

// 오행 (五行)
export const FIVE_ELEMENTS = {
  목: { name: '木', color: 'text-green-600', bgColor: 'bg-green-50', barColor: 'bg-green-500' },
  화: { name: '火', color: 'text-red-600', bgColor: 'bg-red-50', barColor: 'bg-red-500' },
  토: { name: '土', color: 'text-yellow-600', bgColor: 'bg-yellow-50', barColor: 'bg-yellow-500' },
  금: { name: '金', color: 'text-gray-800', bgColor: 'bg-gray-100 border border-gray-300', barColor: 'bg-gray-600' },
  수: { name: '水', color: 'text-blue-700', bgColor: 'bg-blue-50', barColor: 'bg-blue-500' },
} as const;

// 십간의 오행
export const GAN_ELEMENTS: Record<number, keyof typeof FIVE_ELEMENTS> = {
  0: '목', // 갑
  1: '목', // 을
  2: '화', // 병
  3: '화', // 정
  4: '토', // 무
  5: '토', // 기
  6: '금', // 경
  7: '금', // 신
  8: '수', // 임
  9: '수', // 계
};

// 십이지의 오행
export const JI_ELEMENTS: Record<number, keyof typeof FIVE_ELEMENTS> = {
  0: '수', // 자
  1: '토', // 축
  2: '목', // 인
  3: '목', // 묘
  4: '토', // 진
  5: '화', // 사
  6: '화', // 오
  7: '토', // 미
  8: '금', // 신
  9: '금', // 유
  10: '토', // 술
  11: '수', // 해
};

// 십이지의 시간 (자시 子時 00:00 시작)
export const JI_HOURS: Record<number, string> = {
  0: '00:00-01:29', // 자
  1: '01:30-03:29', // 축
  2: '03:30-05:29', // 인
  3: '05:30-07:29', // 묘
  4: '07:30-09:29', // 진
  5: '09:30-11:29', // 사
  6: '11:30-13:29', // 오
  7: '13:30-15:29', // 미
  8: '15:30-17:29', // 신
  9: '17:30-19:29', // 유
  10: '19:30-21:59', // 술
  11: '22:00-23:59', // 해
};

/** 時 선택용 (자시 00:00 기준, 각 時당 대표 시·분) */
export const JI_HOUR_SELECTIONS = [
  { jiIndex: 0, name: '자', nameKo: '자', range: '00:00-01:29', hour: 0, minute: 0 },
  { jiIndex: 1, name: '축', nameKo: '축', range: '01:30-03:29', hour: 2, minute: 0 },
  { jiIndex: 2, name: '인', nameKo: '인', range: '03:30-05:29', hour: 4, minute: 0 },
  { jiIndex: 3, name: '묘', nameKo: '묘', range: '05:30-07:29', hour: 6, minute: 0 },
  { jiIndex: 4, name: '진', nameKo: '진', range: '07:30-09:29', hour: 8, minute: 0 },
  { jiIndex: 5, name: '사', nameKo: '사', range: '09:30-11:29', hour: 10, minute: 0 },
  { jiIndex: 6, name: '오', nameKo: '오', range: '11:30-13:29', hour: 12, minute: 0 },
  { jiIndex: 7, name: '미', nameKo: '미', range: '13:30-15:29', hour: 14, minute: 0 },
  { jiIndex: 8, name: '신', nameKo: '신', range: '15:30-17:29', hour: 16, minute: 0 },
  { jiIndex: 9, name: '유', nameKo: '유', range: '17:30-19:29', hour: 18, minute: 0 },
  { jiIndex: 10, name: '술', nameKo: '술', range: '19:30-21:59', hour: 20, minute: 0 },
  { jiIndex: 11, name: '해', nameKo: '해', range: '22:00-23:59', hour: 22, minute: 0 },
] as const;

// 십이지의 장간(藏干) - 만세력 기준
// 각 지지에 숨어있는 간지들
export const JI_HIDDEN_GANS: Record<number, number[]> = {
  0: [9], // 자: 계수(癸)
  1: [5, 9, 7], // 축: 기토(己), 계수(癸), 신금(辛)
  2: [4, 2, 0], // 인: 무토(戊), 병화(丙), 갑목(甲)
  3: [1], // 묘: 을목(乙)
  4: [4, 1, 9], // 진: 무토(戊), 을목(乙), 계수(癸)
  5: [4, 6, 2], // 사: 무토(戊), 경금(庚), 병화(丙)
  6: [5, 3], // 오: 기토(己), 정화(丁)
  7: [5, 3, 1], // 미: 기토(己), 정화(丁), 을목(乙)
  8: [4, 8, 6], // 신: 무토(戊), 임수(壬), 경금(庚)
  9: [7], // 유: 신금(辛)
  10: [4, 7, 3], // 술: 무토(戊), 신금(辛), 정화(丁)
  11: [0, 8], // 해: 갑목(甲), 임수(壬)
};

// 십성 (十神)
export const TEN_SIBS = {
  비견: { name: '比肩', shortName: '비', description: '같은 오행, 같은 음양' },
  겁재: { name: '劫財', shortName: '겁', description: '같은 오행, 다른 음양' },
  식신: { name: '食神', shortName: '식', description: '내가 낳는 것, 같은 음양' },
  상관: { name: '傷官', shortName: '상', description: '내가 낳는 것, 다른 음양' },
  편재: { name: '偏財', shortName: '편재', description: '내가 극하는 것, 같은 음양' },
  정재: { name: '正財', shortName: '정재', description: '내가 극하는 것, 다른 음양' },
  편관: { name: '偏官', shortName: '편관', description: '나를 극하는 것, 같은 음양' },
  정관: { name: '正官', shortName: '정관', description: '나를 극하는 것, 다른 음양' },
  편인: { name: '偏印', shortName: '편인', description: '나를 낳는 것, 같은 음양' },
  정인: { name: '正印', shortName: '정인', description: '나를 낳는 것, 다른 음양' },
} as const;

// 오행 상생 관계 (생: 낳는다)
export const ELEMENT_GENERATES: Record<ElementType, ElementType> = {
  목: '화', // 목생화
  화: '토', // 화생토
  토: '금', // 토생금
  금: '수', // 금생수
  수: '목', // 수생목
};

// 오행 상극 관계 (극: 극한다)
export const ELEMENT_OVERCOMES: Record<ElementType, ElementType> = {
  목: '토', // 목극토
  토: '수', // 토극수
  수: '화', // 수극화
  화: '금', // 화극금
  금: '목', // 금극목
};

export type GanType = (typeof TEN_GAN)[number];
export type JiType = (typeof TWELVE_JI)[number];
export type ElementType = keyof typeof FIVE_ELEMENTS;
export type SibType = keyof typeof TEN_SIBS;
