'use client';

import { Card } from '@/components/ui/card';
import { SajuResult as SajuResultType, calculateElementCount, ElementCount } from '../lib/calculator';
import {
  FIVE_ELEMENTS,
  TEN_SIBS,
  TEN_GAN,
  TWELVE_JI,
  TEN_GAN_NAMES,
  GAN_ELEMENTS,
  JI_ELEMENTS,
  JI_HIDDEN_GANS,
  SibType,
  ElementType,
} from '../constants/ganji';
import { SIB_CHARACTERISTICS } from '../constants/sibCharacteristics';
import { ELEMENT_CHARACTERISTICS } from '../constants/elementCharacteristics';
import { calculateElementRelationship } from '../lib/elementRelationship';
import { analyzeYearFortune } from '../lib/yearFortune';
import { WOONSUNG_NAMES, getWoonsungIndex, getShinsal } from '../constants/woonsungShinsal';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ArrowDown, User, DollarSign, Heart, Info, Calendar, HelpCircle } from 'lucide-react';

interface SajuResultProps {
  result: SajuResultType;
  dataSource?: 'api' | 'client' | null;
}

const ELEMENT_SHORT: Record<ElementType, string> = {
  목: '목',
  화: '화',
  토: '토',
  금: '금',
  수: '수',
};

const ELEMENT_ORDER: ElementType[] = ['목', '화', '토', '금', '수'];
const SIB_DISPLAY_ORDER: SibType[] = [
  '식신', '상관', '편재', '정재', '편관', '정관', '편인', '정인', '비견', '겁재',
];

const ELEMENT_DONUT_COLORS: Record<ElementType, string> = {
  목: '#22c55e',
  화: '#ef4444',
  토: '#eab308',
  금: '#78716c',
  수: '#1e40af',
};

const SIB_DONUT_COLORS = [
  '#64748b', '#475569', '#334155', '#1e293b', '#0f172a',
  '#94a3b8', '#cbd5e1', '#f1f5f9', '#94a3b8', '#64748b',
];

function getElementLabel(percentage: number): '부족' | '적정' | '발달' | '과다' {
  if (percentage <= 0) return '부족';
  if (percentage <= 12.5) return '적정';
  if (percentage <= 25) return '발달';
  return '과다';
}

function computeSibCount(result: SajuResultType): Record<SibType, number> {
  const sibCount: Record<SibType, number> = {
    비견: 0, 겁재: 0, 식신: 0, 상관: 0, 편재: 0, 정재: 0, 편관: 0, 정관: 0, 편인: 0, 정인: 0,
  };
  const positions: SibType[] = [
    result.year.ganSib as SibType,
    result.year.jiSib,
    ...(result.year.jiHiddenSibs ?? []),
    result.month.ganSib as SibType,
    result.month.jiSib,
    ...(result.month.jiHiddenSibs ?? []),
    result.day.jiSib,
    ...(result.day.jiHiddenSibs ?? []),
    ...(result.hour
      ? [result.hour.ganSib as SibType, result.hour.jiSib, ...(result.hour.jiHiddenSibs ?? [])]
      : []),
  ];
  positions.forEach((sib) => {
    sibCount[sib]++;
  });
  return sibCount;
}

function ganIndex(gan: string): number {
  return TEN_GAN.indexOf(gan as (typeof TEN_GAN)[number]);
}

function jiIndex(ji: string): number {
  return TWELVE_JI.indexOf(ji as (typeof TWELVE_JI)[number]);
}

function elementSignGan(ganIdx: number): string {
  const el = GAN_ELEMENTS[ganIdx];
  const yang = ganIdx % 2 === 0;
  return (yang ? '+' : '-') + ELEMENT_SHORT[el];
}

function elementSignJi(jiIdx: number): string {
  const el = JI_ELEMENTS[jiIdx];
  const yang = jiIdx % 2 === 0;
  return (yang ? '+' : '-') + ELEMENT_SHORT[el];
}

function elementColorClass(el: ElementType): string {
  return FIVE_ELEMENTS[el].color;
}

function formatJijanggan(jiIdx: number): string {
  const hidden = JI_HIDDEN_GANS[jiIdx] ?? [];
  return hidden.map((g) => TEN_GAN_NAMES[g]).join('');
}

export function SajuResult({ result, dataSource }: SajuResultProps) {
  const elementCount = calculateElementCount(result);
  const dayGanIdx = ganIndex(result.day.gan);

  const pillars = [
    ...(result.hour
      ? [{ key: 'hour' as const, label: '생시', ...result.hour, jiIdx: jiIndex(result.hour.ji) }]
      : []),
    { key: 'day' as const, label: '생일', ...result.day, jiIdx: jiIndex(result.day.ji) },
    { key: 'month' as const, label: '생월', ...result.month, jiIdx: jiIndex(result.month.ji) },
    { key: 'year' as const, label: '생년', ...result.year, jiIdx: jiIndex(result.year.ji) },
  ];

  const sourceLabel =
    dataSource === 'api'
      ? '24절기: 한국천문연구원 API 적용'
      : dataSource === 'client'
        ? '24절기: 로컬 데이터 적용'
        : null;

  return (
    <div className="space-y-6">
      <Card className="p-6 md:p-8 bg-amber-50/50 border-amber-200/60">
        {sourceLabel && (
          <p className="mb-4 px-4 py-2 text-sm rounded-md bg-blue-50 text-blue-800 border border-blue-200">
            {sourceLabel}
          </p>
        )}
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold">사주팔자</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse bg-amber-50/80">
            <thead>
              <tr>
                <th className="border border-amber-300/80 bg-amber-100/80 px-2 py-3 text-sm font-semibold text-stone-700 w-20">
                  구분
                </th>
                {pillars.map((p) => (
                  <th
                    key={p.key}
                    className="border border-amber-300/80 bg-amber-100/80 px-3 py-3 text-sm font-semibold text-stone-800"
                  >
                    {p.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-amber-300/80 px-2 py-2 text-xs font-medium text-stone-600 bg-amber-50">
                  천간
                </td>
                {pillars.map((p) => {
                  const gIdx = ganIndex(p.gan);
                  const sign = elementSignGan(gIdx);
                  const el = GAN_ELEMENTS[gIdx];
                  const isDay = p.key === 'day';
                  return (
                    <td
                      key={p.key}
                      className={`border border-amber-300/80 px-2 py-3 ${isDay ? 'bg-sky-50/80' : 'bg-white'}`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span className={`text-sm text-stone-600 ${elementColorClass(el)}`}>{p.ganName}</span>
                        <span className={`text-2xl font-bold ${elementColorClass(el)}`}>{p.gan}</span>
                        <span className={`text-xs ${elementColorClass(el)}`}>{sign}</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="border border-amber-300/80 px-2 py-2 text-xs font-medium text-stone-600 bg-amber-50">
                  십성
                </td>
                {pillars.map((p) => (
                  <td key={p.key} className="border border-amber-300/80 px-2 py-2 bg-white">
                    {p.key === 'day' ? (
                      <span className="text-sm font-semibold text-blue-700">비견</span>
                    ) : (
                      <span className="text-sm text-stone-800">
                        {TEN_SIBS[p.ganSib as SibType]?.shortName ?? ''}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border border-amber-300/80 px-2 py-2 text-xs font-medium text-stone-600 bg-amber-50">
                  지지
                </td>
                {pillars.map((p) => {
                  const sign = elementSignJi(p.jiIdx);
                  const el = JI_ELEMENTS[p.jiIdx];
                  const isDay = p.key === 'day';
                  return (
                    <td
                      key={p.key}
                      className={`border border-amber-300/80 px-2 py-3 ${isDay ? 'bg-sky-50/80' : 'bg-white'}`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-sm text-stone-600">{p.jiName}</span>
                        <span className="text-2xl font-bold text-stone-800">{p.ji}</span>
                        <span className={`text-xs ${elementColorClass(el)}`}>{sign}</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="border border-amber-300/80 px-2 py-2 text-xs font-medium text-stone-600 bg-amber-50">
                  십성
                </td>
                {pillars.map((p) => (
                  <td key={p.key} className="border border-amber-300/80 px-2 py-2 bg-white">
                    <span className="text-sm text-stone-800">
                      {TEN_SIBS[p.jiSib]?.shortName ?? ''}
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border border-amber-300/80 px-2 py-2 text-xs font-medium text-stone-600 bg-amber-50">
                  지장간
                </td>
                {pillars.map((p) => (
                  <td key={p.key} className="border border-amber-300/80 px-2 py-2 bg-white">
                    <span className="text-sm text-stone-800">{formatJijanggan(p.jiIdx)}</span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border border-amber-300/80 px-2 py-2 text-xs font-medium text-stone-600 bg-amber-50">
                  12운성
                </td>
                {pillars.map((p) => {
                  const idx = getWoonsungIndex(dayGanIdx, p.jiIdx);
                  return (
                    <td key={p.key} className="border border-amber-300/80 px-2 py-2 bg-white">
                      <span className="text-sm text-stone-800">{WOONSUNG_NAMES[idx]}</span>
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="border border-amber-300/80 px-2 py-2 text-xs font-medium text-stone-600 bg-amber-50">
                  12신살
                </td>
                {pillars.map((p) => (
                  <td key={p.key} className="border border-amber-300/80 px-2 py-2 bg-white">
                    <span className="text-sm text-stone-800">{getShinsal(p.jiIdx)}</span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {result.hour && (
          <div className="mt-4 p-3 bg-amber-100/60 rounded-lg text-center border border-amber-200/60">
            <p className="text-sm text-stone-700">
              <strong>시주 시간:</strong> {result.hour.timeRange}
            </p>
          </div>
        )}

        {!result.hour && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800 text-center">
              태어난 시간을 모르셔서 시주는 계산하지 않았습니다.
            </p>
          </div>
        )}
      </Card>

      <YearFortune result={result} />

      <SibExplanation result={result} />

      <SibPersonalityAnalysis result={result} />

      <DayGanElementRelationship dayElement={result.day.element} />

      <ElementAndSibCharts elementCount={elementCount} result={result} />

      <MyElementWheel result={result} elementCount={elementCount} />
    </div>
  );
}

function DayGanElementRelationship({ dayElement }: { dayElement: ElementType }) {
  const relationship = calculateElementRelationship(dayElement);
  const selfInfo = FIVE_ELEMENTS[relationship.self];
  const generatesInfo = FIVE_ELEMENTS[relationship.generates];
  const generatedByInfo = FIVE_ELEMENTS[relationship.generatedBy];
  const overcomesInfo = FIVE_ELEMENTS[relationship.overcomes];
  const overcomeByInfo = FIVE_ELEMENTS[relationship.overcomeBy];

  return (
    <Card className="p-6 md:p-8">
      <h3 className="text-xl font-bold mb-4">일간 기준 오행 관계</h3>
      
      <div className="space-y-6">
        {/* 일간 (자신) */}
        <div className="flex flex-col items-center">
          <div className={`px-6 py-4 rounded-lg border-2 ${selfInfo.bgColor} ${selfInfo.color} font-bold text-lg`}>
            일간: {relationship.self} {selfInfo.name}
          </div>
        </div>

        {/* 관계도 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 상생 관계 */}
          <div className="space-y-4">
            <h4 className="font-semibold text-center text-green-700">상생 관계 (생)</h4>
            <div className="space-y-3">
              {/* 나를 낳는 것 (생당) */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">나를 낳는 것:</span>
                  <span className={`font-semibold ${generatedByInfo.color}`}>
                    {relationship.generatedBy} {generatedByInfo.name}
                  </span>
                </div>
                <ArrowDown className="w-4 h-4 text-green-600" />
              </div>
              
              {/* 내가 낳는 것 (생) */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border">
                <ArrowRight className="w-4 h-4 text-green-600" />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">내가 낳는 것:</span>
                  <span className={`font-semibold ${generatesInfo.color}`}>
                    {relationship.generates} {generatesInfo.name}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 상극 관계 */}
          <div className="space-y-4">
            <h4 className="font-semibold text-center text-red-700">상극 관계 (극)</h4>
            <div className="space-y-3">
              {/* 나를 극하는 것 (극당) */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">나를 극하는 것:</span>
                  <span className={`font-semibold ${overcomeByInfo.color}`}>
                    {relationship.overcomeBy} {overcomeByInfo.name}
                  </span>
                </div>
                <ArrowDown className="w-4 h-4 text-red-600" />
              </div>
              
              {/* 내가 극하는 것 (극) */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border">
                <ArrowRight className="w-4 h-4 text-red-600" />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">내가 극하는 것:</span>
                  <span className={`font-semibold ${overcomesInfo.color}`}>
                    {relationship.overcomes} {overcomesInfo.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 설명 */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>상생(相生):</strong> 나를 도와주는 관계. {relationship.generatedBy} → {relationship.self} → {relationship.generates}
            <br />
            <strong>상극(相剋):</strong> 서로 대립하는 관계. {relationship.overcomeBy} → {relationship.self} → {relationship.overcomes}
          </p>
        </div>
      </div>
    </Card>
  );
}

function SibPersonalityAnalysis({ result }: { result: SajuResultType }) {
  // 사주팔자에 나타나는 모든 십성 수집 (위치 정보 포함) - 만세력 기준
  const sibPositions: Array<{ sib: SibType | '일간'; position: string; ganJi: string }> = [
    { sib: result.year.ganSib as SibType | '일간', position: '년주', ganJi: '간지' },
    { sib: result.year.jiSib, position: '년주', ganJi: '지지' },
    ...(result.year.jiHiddenSibs || []).map((sib) => ({ sib, position: '년주', ganJi: '지지(장간)' })),
    { sib: result.month.ganSib as SibType | '일간', position: '월주', ganJi: '간지' },
    { sib: result.month.jiSib, position: '월주', ganJi: '지지' },
    ...(result.month.jiHiddenSibs || []).map((sib) => ({ sib, position: '월주', ganJi: '지지(장간)' })),
    { sib: '일간', position: '일주', ganJi: '간지' },
    { sib: result.day.jiSib, position: '일주', ganJi: '지지' },
    ...(result.day.jiHiddenSibs || []).map((sib) => ({ sib, position: '일주', ganJi: '지지(장간)' })),
    ...(result.hour ? [
      { sib: result.hour.ganSib as SibType | '일간', position: '시주', ganJi: '간지' },
      { sib: result.hour.jiSib, position: '시주', ganJi: '지지' },
      ...(result.hour.jiHiddenSibs || []).map((sib) => ({ sib, position: '시주', ganJi: '지지(장간)' })),
    ] : []),
  ];

  // 십성별 개수 계산
  const sibCount: Record<SibType, number> = {
    비견: 0,
    겁재: 0,
    식신: 0,
    상관: 0,
    편재: 0,
    정재: 0,
    편관: 0,
    정관: 0,
    편인: 0,
    정인: 0,
  };

  sibPositions.forEach(({ sib }) => {
    if (sib !== '일간') {
      sibCount[sib]++;
    }
  });

  // 십성별 위치 정보 수집
  const sibLocationMap: Record<SibType, Array<{ position: string; ganJi: string }>> = {
    비견: [],
    겁재: [],
    식신: [],
    상관: [],
    편재: [],
    정재: [],
    편관: [],
    정관: [],
    편인: [],
    정인: [],
  };

  sibPositions.forEach(({ sib, position, ganJi }) => {
    if (sib !== '일간') {
      sibLocationMap[sib].push({ position, ganJi });
    }
  });

  // 가장 많이 나타나는 십성들 찾기
  const maxCount = Math.max(...Object.values(sibCount));
  const dominantSibs = Object.entries(sibCount)
    .filter(([, count]) => count === maxCount && count > 0)
    .map(([sib]) => sib as SibType);

  // 주요 십성들의 특성 종합
  const getCombinedCharacteristics = () => {
    if (dominantSibs.length === 0) return null;

    const characteristics = dominantSibs.map((sib) => SIB_CHARACTERISTICS[sib]);
    
    return {
      personality: characteristics.map((c) => c.personality).join(' '),
      wealth: characteristics.map((c) => c.wealth).join(' '),
      marriage: characteristics.map((c) => c.marriage).join(' '),
    };
  };

  const combined = getCombinedCharacteristics();

  return (
    <Card className="p-6 md:p-8">
      <h3 className="text-xl font-bold mb-4">십성 결과 분석</h3>

      {/* 사주팔자 십성 표 */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3 text-sm text-muted-foreground">사주팔자 십성 배치</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left">구분</th>
                <th className="border border-gray-300 px-3 py-2 text-center">간지</th>
                <th className="border border-gray-300 px-3 py-2 text-center">지지</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-3 py-2 font-medium">년주</td>
                <td className="border border-gray-300 px-3 py-2 text-center">
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                    {TEN_SIBS[result.year.ganSib as SibType].name}
                  </span>
                </td>
                <td className="border border-gray-300 px-3 py-2 text-center">
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                    {TEN_SIBS[result.year.jiSib].name}
                  </span>
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-3 py-2 font-medium">월주</td>
                <td className="border border-gray-300 px-3 py-2 text-center">
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                    {TEN_SIBS[result.month.ganSib as SibType].name}
                  </span>
                </td>
                <td className="border border-gray-300 px-3 py-2 text-center">
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                    {TEN_SIBS[result.month.jiSib].name}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2 font-medium">일주</td>
                <td className="border border-gray-300 px-3 py-2 text-center">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                    일간
                  </span>
                </td>
                <td className="border border-gray-300 px-3 py-2 text-center">
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                    {TEN_SIBS[result.day.jiSib].name}
                  </span>
                </td>
              </tr>
              {result.hour && (
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-3 py-2 font-medium">시주</td>
                  <td className="border border-gray-300 px-3 py-2 text-center">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                      {TEN_SIBS[result.hour.ganSib as SibType].name}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                      {TEN_SIBS[result.hour.jiSib].name}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 십성별 개수 및 위치 */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3 text-sm text-muted-foreground">십성별 개수 및 위치</h4>
        <div className="space-y-3">
          {Object.entries(sibCount)
            .filter(([, count]) => count > 0)
            .sort(([, a], [, b]) => b - a)
            .map(([sib, count]) => {
              const locations = sibLocationMap[sib as SibType];
              return (
                <div
                  key={sib}
                  className="p-3 rounded-lg bg-gray-50 border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-purple-700">
                        {TEN_SIBS[sib as SibType].name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({TEN_SIBS[sib as SibType].shortName})
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-600">{count}개</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {locations.map((loc, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-purple-50 text-purple-600 rounded"
                      >
                        {loc.position} {loc.ganJi}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {dominantSibs.length > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
          <p className="text-sm font-semibold mb-2">
            주요 십성: {dominantSibs.map((sib) => `${TEN_SIBS[sib].name}(${TEN_SIBS[sib].shortName})`).join(', ')}
          </p>
          <p className="text-xs text-muted-foreground">
            사주팔자에서 가장 많이 나타나는 십성입니다.
          </p>
        </div>
      )}

      {combined && (
        <div className="space-y-6">
          {/* 성향 */}
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-blue-900">성향</h4>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{combined.personality}</p>
          </div>

          {/* 재물 */}
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-green-900">재물</h4>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{combined.wealth}</p>
          </div>

          {/* 결혼 성향 */}
          <div className="p-4 rounded-lg bg-pink-50 border border-pink-200">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-pink-600" />
              <h4 className="font-semibold text-pink-900">결혼 성향</h4>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{combined.marriage}</p>
          </div>
        </div>
      )}
    </Card>
  );
}

function YearFortune({ result }: { result: SajuResultType }) {
  const yearFortune = analyzeYearFortune(result);
  const elementInfo = FIVE_ELEMENTS[yearFortune.yearElement];
  const sibInfo = TEN_SIBS[yearFortune.yearSib];
  const relationLabel =
    yearFortune.relationType === '생'
      ? '상생'
      : yearFortune.relationType === '극'
        ? '상극'
        : '비겁';

  return (
    <Card className="p-6 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-6 h-6 text-purple-600" />
        <h3 className="text-xl font-bold">올해 운세 ({yearFortune.year}년)</h3>
      </div>

      <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <span className="text-sm font-medium text-muted-foreground">올해 세운</span>
          <span className="text-2xl font-bold">
            {yearFortune.yearGan}
            {yearFortune.yearJi}
          </span>
          <span className="text-muted-foreground">
            ({yearFortune.yearGanName}{yearFortune.yearJiName}년)
          </span>
          <span
            className={`px-2 py-1 rounded text-sm font-medium ${elementInfo.bgColor} ${elementInfo.color}`}
          >
            {yearFortune.yearElement} {elementInfo.name}
          </span>
          <span className="px-2 py-1 rounded text-sm font-medium bg-purple-100 text-purple-700">
            {sibInfo.name} ({sibInfo.shortName})
          </span>
          <span className="text-xs text-muted-foreground">· {relationLabel}</span>
        </div>
        <p className="text-sm text-muted-foreground">{yearFortune.relationDetail}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-green-50 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-green-900">재물</h4>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{yearFortune.fortune.wealth}</p>
        </div>
        <div className="p-4 rounded-lg bg-pink-50 border border-pink-200">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-pink-600" />
            <h4 className="font-semibold text-pink-900">인연</h4>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{yearFortune.fortune.relationship}</p>
        </div>
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-900">직업·학업</h4>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{yearFortune.fortune.career}</p>
        </div>
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-5 h-5 text-amber-600" />
            <h4 className="font-semibold text-amber-900">건강</h4>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{yearFortune.fortune.health}</p>
        </div>
      </div>
    </Card>
  );
}

function SibExplanation({ result }: { result: SajuResultType }) {
  // 사주팔자에 나타난 십성들만 수집
  const appearedSibs = new Set<SibType>([
    result.year.ganSib as SibType,
    result.year.jiSib,
    result.month.ganSib as SibType,
    result.month.jiSib,
    result.day.jiSib,
    ...(result.hour ? [
      result.hour.ganSib as SibType,
      result.hour.jiSib,
    ] : []),
  ]);

  return (
    <Card className="p-6 md:p-8">
      <h3 className="text-xl font-bold mb-4">십성 설명</h3>
      <p className="text-sm text-muted-foreground mb-4">
        이 사주팔자에 나타난 십성들의 설명입니다.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(TEN_SIBS)
          .filter(([key]) => appearedSibs.has(key as SibType))
          .map(([key, sib]) => (
            <div
              key={key}
              className="p-3 rounded-lg bg-gray-50 border border-gray-200"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-purple-700">{sib.name}</span>
                <span className="text-sm text-muted-foreground">({sib.shortName})</span>
              </div>
              <p className="text-xs text-muted-foreground">{sib.description}</p>
            </div>
          ))}
      </div>
    </Card>
  );
}

function ElementAndSibCharts({
  elementCount,
  result,
}: {
  elementCount: ElementCount;
  result: SajuResultType;
}) {
  const ELEMENT_TOTAL = 8;
  const sibCount = computeSibCount(result);
  const sibTotal = Object.values(sibCount).reduce((a, b) => a + b, 0);

  const elementData = ELEMENT_ORDER.map((el) => ({
    key: el,
    count: elementCount[el],
    percentage: (elementCount[el] / ELEMENT_TOTAL) * 100,
  }));
  const elementConicParts = elementData
    .filter((d) => d.count > 0)
    .reduce<{ acc: string; prev: number }>(
      (r, d) => {
        const next = r.prev + d.percentage;
        const part = `${ELEMENT_DONUT_COLORS[d.key]} ${r.prev}% ${next}%`;
        return { acc: r.acc ? `${r.acc}, ${part}` : part, prev: next };
      },
      { acc: '', prev: 0 }
    );
  const dominantElement =
    elementData.reduce((a, b) => (b.count > a.count ? b : a), elementData[0]);
  const dominantElementInfo =
    dominantElement.count > 0
      ? FIVE_ELEMENTS[dominantElement.key]
      : null;

  const sibData = SIB_DISPLAY_ORDER.map((sib, i) => ({
    key: sib,
    count: sibCount[sib],
    percentage: sibTotal > 0 ? (sibCount[sib] / sibTotal) * 100 : 0,
    color: SIB_DONUT_COLORS[i],
  }));
  const sibConicParts = sibData
    .filter((d) => d.count > 0)
    .reduce<{ acc: string; prev: number }>(
      (r, d) => {
        const next = r.prev + d.percentage;
        const part = `${d.color} ${r.prev}% ${next}%`;
        return { acc: r.acc ? `${r.acc}, ${part}` : part, prev: next };
      },
      { acc: '', prev: 0 }
    );
  const dominantSib = sibData.reduce((a, b) => (b.count > a.count ? b : a), sibData[0]);
  const dominantSibInfo =
    dominantSib.count > 0 ? TEN_SIBS[dominantSib.key] : null;

  return (
    <Card className="p-6 md:p-8 bg-stone-50/80 border-stone-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 오행 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-stone-800">오행</h3>
            <HelpCircle className="w-4 h-4 text-stone-500" aria-hidden />
          </div>
          <div className="flex flex-col items-center gap-4">
            <div
              className="relative w-40 h-40 rounded-full border border-stone-300 bg-stone-100"
              style={{
                background: elementConicParts.acc
                  ? `conic-gradient(from 0deg, ${elementConicParts.acc})`
                  : undefined,
              }}
            >
              <div className="absolute inset-[15%] rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center">
                {dominantElementInfo && (
                  <span
                    className={`text-xl font-bold ${dominantElementInfo.color}`}
                  >
                    {dominantElement.key} {dominantElementInfo.name}
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm font-medium text-stone-600">오행 Q</p>
            <table className="w-full text-sm border-collapse bg-white border border-stone-200 rounded overflow-hidden">
              <thead>
                <tr className="bg-stone-100">
                  <th className="border-b border-stone-200 px-3 py-2 text-left font-semibold text-stone-700">
                    구분
                  </th>
                  <th className="border-b border-stone-200 px-3 py-2 text-right font-semibold text-stone-700 w-28">
                    비율
                  </th>
                </tr>
              </thead>
              <tbody>
                {ELEMENT_ORDER.map((el, i) => {
                  const d = elementData[i];
                  const info = FIVE_ELEMENTS[el];
                  const label = getElementLabel(d.percentage);
                  return (
                    <tr
                      key={el}
                      className={i % 2 === 0 ? 'bg-stone-50/50' : 'bg-white'}
                    >
                      <td className={`border-b border-stone-100 px-3 py-2 ${info.color} font-medium`}>
                        {el} {info.name}
                      </td>
                      <td className="border-b border-stone-100 px-3 py-2 text-right text-stone-700">
                        {d.percentage.toFixed(1)}% {label}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 십성 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-stone-800">십성</h3>
            <HelpCircle className="w-4 h-4 text-stone-500" aria-hidden />
          </div>
          <div className="flex flex-col items-center gap-4">
            <div
              className="relative w-40 h-40 rounded-full border border-stone-300 bg-stone-100"
              style={{
                background: sibConicParts.acc
                  ? `conic-gradient(from 0deg, ${sibConicParts.acc})`
                  : undefined,
              }}
            >
              <div className="absolute inset-[15%] rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-center">
                {dominantSibInfo && (
                  <span className="text-sm font-bold text-stone-800">
                    {dominantSibInfo.name}
                    <br />
                    {dominantSibInfo.shortName}
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm font-medium text-stone-600">십성 Q</p>
            <table className="w-full text-sm border-collapse bg-white border border-stone-200 rounded overflow-hidden">
              <thead>
                <tr className="bg-stone-100">
                  <th className="border-b border-stone-200 px-3 py-2 text-left font-semibold text-stone-700">
                    구분
                  </th>
                  <th className="border-b border-stone-200 px-3 py-2 text-right font-semibold text-stone-700 w-20">
                    비율
                  </th>
                </tr>
              </thead>
              <tbody>
                {SIB_DISPLAY_ORDER.map((sib, i) => {
                  const d = sibData[i];
                  const info = TEN_SIBS[sib];
                  return (
                    <tr
                      key={sib}
                      className={i % 2 === 0 ? 'bg-stone-50/50' : 'bg-white'}
                    >
                      <td className="border-b border-stone-100 px-3 py-2 text-stone-800 font-medium">
                        {info.name}({info.shortName})
                      </td>
                      <td className="border-b border-stone-100 px-3 py-2 text-right text-stone-700">
                        {d.count > 0 ? `${d.percentage.toFixed(1)}%` : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Card>
  );
}

/** 일간 기준 오행 십성 그룹: 비겁(비견+겁재), 식상(식신+상관), 재성(편재+정재), 관성(편관+정관), 인성(편인+정인) */
function getSibGroupForElement(
  rel: ReturnType<typeof calculateElementRelationship>,
  el: ElementType
): string {
  if (rel.self === el) return '비겁';
  if (rel.generates === el) return '식상';
  if (rel.overcomes === el) return '재성';
  if (rel.overcomeBy === el) return '관성';
  if (rel.generatedBy === el) return '인성';
  return '';
}

/** 나의 오행: 일간 기준 오행·십성 그룹·비율 원형 다이어그램 */
function MyElementWheel({
  result,
  elementCount,
}: {
  result: SajuResultType;
  elementCount: ElementCount;
}) {
  const dayElement = result.day.element;
  const dayGanName = result.day.ganName;
  const rel = calculateElementRelationship(dayElement);
  const ELEMENT_TOTAL = 8;
  const cycleOrder: ElementType[] = ['수', '목', '화', '토', '금'];

  const cx = 200;
  const cy = 200;
  const r = 140;
  const nodeR = 52;

  const positions = cycleOrder.map((_, i) => {
    const deg = -90 + i * 72;
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  });

  const genArrowPath = (fromIdx: number, toIdx: number) => {
    const from = positions[fromIdx];
    const to = positions[toIdx];
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const x1 = from.x + (dx / len) * nodeR;
    const y1 = from.y + (dy / len) * nodeR;
    const x2 = to.x - (dx / len) * nodeR;
    const y2 = to.y - (dy / len) * nodeR;
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  };

  return (
    <Card className="p-6 md:p-8 bg-stone-50/80 border-stone-200">
      <h3 className="text-xl font-bold text-stone-800 mb-2">
        나의 오행: {dayGanName}
        {FIVE_ELEMENTS[dayElement].name}
      </h3>
      <div className="flex items-center gap-4 mb-6 text-sm text-stone-600">
        <span className="flex items-center gap-1">
          <ArrowRight className="w-4 h-4 text-blue-600" aria-hidden />
          생(生)
        </span>
        <span className="flex items-center gap-1">
          <ArrowRight className="w-4 h-4 text-red-600" aria-hidden />
          극(剋)
        </span>
      </div>
      <div className="flex justify-center overflow-x-auto">
        <svg
          viewBox="0 0 400 400"
          className="w-full max-w-[400px] h-auto"
          aria-label="나의 오행 다이어그램"
        >
          {/* 생(生) 사이클 - 파란 화살표: 金→水→木→火→土→金 */}
          {[0, 1, 2, 3, 4].map((i) => (
            <path
              key={`gen-${i}`}
              d={genArrowPath(i, (i + 1) % 5)}
              fill="none"
              stroke="#2563eb"
              strokeWidth="2"
              markerEnd="url(#arrow-blue)"
            />
          ))}
          {/* 극(剋) 사이클 - 빨간 화살표: 水→火→金→木→土→水 (0→2→4→1→3→0) */}
          {[[0, 2], [2, 4], [4, 1], [1, 3], [3, 0]].map(([from, to], i) => (
            <path
              key={`over-${i}`}
              d={genArrowPath(from, to)}
              fill="none"
              stroke="#dc2626"
              strokeWidth="2"
              markerEnd="url(#arrow-red)"
            />
          ))}
          <defs>
            <marker
              id="arrow-blue"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,6 L9,3 z" fill="#2563eb" />
            </marker>
            <marker
              id="arrow-red"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,6 L9,3 z" fill="#dc2626" />
            </marker>
          </defs>
          {cycleOrder.map((el, i) => {
            const pos = positions[i];
            const pct = (elementCount[el] / ELEMENT_TOTAL) * 100;
            const sibGroup = getSibGroupForElement(rel, el);
            return (
              <g key={el}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={nodeR}
                  fill="white"
                  stroke="#d6d3d1"
                  strokeWidth="1.5"
                />
                <rect
                  x={pos.x - nodeR + 4}
                  y={pos.y + nodeR - 4 - (pct / 100) * (nodeR * 2 - 8)}
                  width={8}
                  height={(pct / 100) * (nodeR * 2 - 8) || 0}
                  rx={2}
                  fill={ELEMENT_DONUT_COLORS[el]}
                  opacity={0.8}
                />
                <text
                  x={pos.x}
                  y={pos.y - 6}
                  textAnchor="middle"
                  className="text-sm font-semibold"
                  fill="#44403c"
                >
                  {el}({sibGroup})
                </text>
                <text
                  x={pos.x}
                  y={pos.y + 10}
                  textAnchor="middle"
                  className="text-xs"
                  fill="#78716c"
                >
                  {pct.toFixed(1)}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </Card>
  );
}
