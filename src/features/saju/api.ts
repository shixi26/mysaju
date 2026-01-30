import type { SajuResult } from './lib/calculator';

export interface SajuApiRequest {
  year: number;
  month: number;
  day: number;
  hour: number | null;
  minute?: number;
}

/**
 * 서버 API로 만세력 계산 요청
 * API route가 없는 정적 배포(GitHub Pages 등)에서는 실패함
 */
function getApiBase(): string {
  if (typeof window === 'undefined') return '';
  const p = window.location.pathname.replace(/\/$/, '');
  const parts = p.split('/').filter(Boolean);
  if (parts.length === 0) return '';
  return '/' + parts[0];
}

export async function fetchSajuFromApi(
  data: SajuApiRequest
): Promise<SajuResult | null> {
  try {
    const base = getApiBase();
    const url = `${base}/api/saju`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        year: data.year,
        month: data.month,
        day: data.day,
        hour: data.hour,
        minute: data.minute ?? 0,
      }),
    });

    if (!res.ok) return null;
    return (await res.json()) as SajuResult;
  } catch {
    return null;
  }
}
