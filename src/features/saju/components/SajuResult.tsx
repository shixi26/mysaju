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
import { Sparkles, ArrowRight, ArrowDown, User, DollarSign, Heart, Info, Calendar } from 'lucide-react';

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

      <ElementAnalysis elementCount={elementCount} />
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
            일간: {selfInfo.name} ({relationship.self})
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
                    {generatedByInfo.name} ({relationship.generatedBy})
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
                    {generatesInfo.name} ({relationship.generates})
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
                    {overcomeByInfo.name} ({relationship.overcomeBy})
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
                    {overcomesInfo.name} ({relationship.overcomes})
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
            {elementInfo.name}
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

function ElementAnalysis({ elementCount }: { elementCount: ElementCount }) {
  const elements = Object.entries(elementCount) as [
    keyof ElementCount,
    number,
  ][];

  const maxCount = Math.max(...elements.map(([, count]) => count));
  const dominantElements = elements
    .filter(([, count]) => count === maxCount)
    .map(([element]) => element);

  return (
    <Card className="p-6 md:p-8">
      <h3 className="text-xl font-bold mb-4">오행 분석</h3>
      <div className="space-y-4">
        {elements.map(([element, count]) => {
          const elementInfo = FIVE_ELEMENTS[element];
          const percentage = (count / 8) * 100;
          const isDominant = dominantElements.includes(element);

          return (
            <div key={element} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-semibold ${elementInfo.color}`}
                  >
                    {elementInfo.name} ({element})
                  </span>
                  {isDominant && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      주력
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium">{count}개</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5 }}
                  className={`h-3 rounded-full ${elementInfo.barColor || elementInfo.bgColor}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {dominantElements.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-5 h-5 text-purple-600" />
              <p className="text-sm font-semibold">
                주력 오행: {dominantElements
                  .map((e) => `${FIVE_ELEMENTS[e].name}(${e})`)
                  .join(', ')}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              {dominantElements.length === 1
                ? '이 오행이 가장 많아 사주팔자의 주요 기운을 형성합니다.'
                : '이 오행들이 가장 많아 사주팔자의 주요 기운을 형성합니다.'}
            </p>
          </div>

          {/* 주력 오행별 상세 설명 */}
          {dominantElements.map((element) => {
            const char = ELEMENT_CHARACTERISTICS[element];
            const elementInfo = FIVE_ELEMENTS[element];
            const count = elementCount[element];
            const percentage = (count / 8) * 100;

            return (
              <div
                key={element}
                className={`p-5 rounded-lg border-2 ${elementInfo.bgColor} border-opacity-50`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-2xl font-bold ${elementInfo.color}`}>
                    {char.name}
                  </span>
                  <div>
                    <h4 className={`font-bold text-lg ${elementInfo.color}`}>
                      {element} 오행 ({count}개, {percentage.toFixed(1)}%)
                    </h4>
                    <p className="text-sm text-muted-foreground">{char.description}</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-semibold mb-1 text-gray-700">성격 특성</p>
                    <p className="text-gray-600 leading-relaxed">{char.personality}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-white/50 rounded-lg">
                      <p className="font-semibold mb-1 text-green-700">강점</p>
                      <p className="text-xs text-gray-600 leading-relaxed">{char.strength}</p>
                    </div>
                    <div className="p-3 bg-white/50 rounded-lg">
                      <p className="font-semibold mb-1 text-orange-700">약점</p>
                      <p className="text-xs text-gray-600 leading-relaxed">{char.weakness}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="font-semibold mb-1 text-blue-700">조언</p>
                    <p className="text-xs text-gray-700 leading-relaxed">{char.advice}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
