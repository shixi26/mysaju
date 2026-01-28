'use client';

import { useState } from 'react';
import { SajuInputForm } from '@/features/saju/components/SajuInputForm';
import { SajuResult } from '@/features/saju/components/SajuResult';
import { calculateSaju } from '@/features/saju/lib/calculator';
import { Stars } from 'lucide-react';

export default function Home() {
  const [sajuResult, setSajuResult] = useState<
    ReturnType<typeof calculateSaju> | null
  >(null);

  const handleSubmit = (data: {
    year: number;
    month: number;
    day: number;
    hour: number | null;
    calendarType: 'solar' | 'lunar';
    gender: 'male' | 'female';
  }) => {
    // 시간을 모를 경우 null로 전달하여 시주를 계산하지 않음
    const result = calculateSaju(data.year, data.month, data.day, data.hour);
    setSajuResult(result);
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
          <SajuInputForm onSubmit={handleSubmit} />

          {sajuResult && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <SajuResult result={sajuResult} />
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-12 p-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-3">사주팔자란?</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            사주팔자는 태어난 연월일시를 기준으로 계산하는 동양의 운세 분석
            방법입니다. 년주, 월주, 일주, 시주로 구성되며, 각각 십간(天干)과
            십이지(地支)로 표현됩니다. 이를 통해 오행(木火土金水)의 균형을
            분석하고 성격과 운세를 파악할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
