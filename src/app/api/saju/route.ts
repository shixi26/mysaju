import { NextResponse } from 'next/server';
import { calculateSaju } from '@/features/saju/lib/calculator';
import {
  fetchSolarTermsForYear,
  type SolarTermsYearData,
} from '@/features/saju/lib/fetchSolarTerms';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { year, month, day, hour, minute = 0 } = body as {
      year?: number;
      month?: number;
      day?: number;
      hour?: number | null;
      minute?: number;
    };

    if (
      typeof year !== 'number' ||
      typeof month !== 'number' ||
      typeof day !== 'number'
    ) {
      return NextResponse.json(
        { error: 'year, month, day는 숫자여야 합니다.' },
        { status: 400 }
      );
    }

    const h = hour == null ? null : Number(hour);
    const m = Number(minute) || 0;

    const solarTermsOverride: Record<number, SolarTermsYearData> = {};

    const yearToFetch = month < 2 ? [year, year - 1] : [year, year + 1];
    for (const y of yearToFetch) {
      const data = await fetchSolarTermsForYear(y);
      if (data) solarTermsOverride[y] = data;
    }

    const result = calculateSaju(year, month, day, h, m, solarTermsOverride);
    return NextResponse.json(result);
  } catch (err) {
    console.error('API /api/saju 오류:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '사주 계산 오류' },
      { status: 500 }
    );
  }
}
