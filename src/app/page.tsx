'use client';

import { useState } from 'react';
import { SajuInputForm } from '@/features/saju/components/SajuInputForm';
import { SajuResult } from '@/features/saju/components/SajuResult';
import { calculateSaju } from '@/features/saju/lib/calculator';
import { fetchSajuFromApi } from '@/features/saju/api';
import { lunarToSolar } from '@/features/saju/lib/lunarToSolar';
import { Stars } from 'lucide-react';

export default function Home() {
  const [sajuResult, setSajuResult] = useState<
    ReturnType<typeof calculateSaju> | null
  >(null);
  const [dataSource, setDataSource] = useState<'api' | 'client' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: {
    year: number;
    month: number;
    day: number;
    hour: number | null;
    minute: number;
    calendarType: 'solar' | 'lunar';
    isIntercalation?: boolean;
    gender: 'male' | 'female';
  }) => {
    setSajuResult(null);
    setDataSource(null);
    setIsLoading(true);
    try {
      let year = data.year;
      let month = data.month;
      let day = data.day;

      if (data.calendarType === 'lunar') {
        const solar = lunarToSolar(
          data.year,
          data.month,
          data.day,
          data.isIntercalation ?? false
        );
        if (!solar) {
          alert('유효하지 않은 음력 날짜입니다.');
          return;
        }
        year = solar.year;
        month = solar.month;
        day = solar.day;
      }

      const apiResult = await fetchSajuFromApi({
        year,
        month,
        day,
        hour: data.hour,
        minute: data.minute,
      });
      if (apiResult) {
        setSajuResult(apiResult);
        setDataSource('api');
        return;
      }
      const result = calculateSaju(year, month, day, data.hour, data.minute);
      setSajuResult(result);
      setDataSource('client');
    } catch (error) {
      console.error('사주 계산 중 오류 발생:', error);
      alert('사주 계산 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Stars className="w-10 h-10 text-purple-600 fill-purple-600" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              사주팔자
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            생년월일시를 입력하시면 사주팔자를 계산해드립니다
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          <SajuInputForm onSubmit={handleSubmit} isLoading={isLoading} />

          {sajuResult && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <SajuResult result={sajuResult} dataSource={dataSource} />
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-12 p-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-3">사주팔자란?</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            사주팔자는 태어난 연월일시를 기준으로 계산하는 동양의 운세 분석
            방법입니다. 년주, 월주, 일주, 시주로 구성되며, 각각 십간(天干)과
            십이지(地支)로 표현됩니다. 년주는 입춘(立春) 기준, 월주는 절기(節氣) 구간
            기준이며, 연도별 24절기는 한국천문연구원 API 데이터를 반영합니다.
            자시(子時)는 00:00부터입니다. 이를 통해 오행(木火土金水)의 균형을
            분석하고 성격과 운세를 파악할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
