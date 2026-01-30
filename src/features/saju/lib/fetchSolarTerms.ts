/**
 * 한국천문연구원 LunPhInfoService API
 * 엔드포인트: http://apis.data.go.kr/B090041/openapi/service/LunPhInfoService/getLunPhInfo
 * 파라미터: solYear, solMonth, solDay, ServiceKey
 */

import axios from 'axios';

const LUN_PH_INFO_URL =
  'http://apis.data.go.kr/B090041/openapi/service/LunPhInfoService/getLunPhInfo';

/** 서버/빌드 전용 - 클라이언트에 노출되지 않음 */
const SERVICE_KEY = process.env.KASI_SERVICE_KEY || '';

interface LunPhInfoResponse {
  response: {
    body: {
      items: {
        item: {
          lunYear: string;
          lunMonth: string;
          lunDay: string;
          solYear: string;
          solMonth: string;
          solDay: string;
          solJd: string;
          lunLeapmonth: string;
          lunSecha: string;
          lunWolgeon: string;
          lunIljin: string;
          [key: string]: string;
        };
      };
    };
  };
}

/**
 * 특정 날짜의 월령 정보 조회
 * @example
 * getLunPhInfo?solYear=2015&solMonth=01&solDay=01&ServiceKey=서비스키
 */
export async function fetchLunPhInfo(
  year: number,
  month: number,
  day: number
): Promise<any> {
  if (!SERVICE_KEY) {
    throw new Error('KASI_SERVICE_KEY를 .env.local에 설정해주세요.');
  }
  try {
    const response = await axios.get(LUN_PH_INFO_URL, {
      params: {
        solYear: year,
        solMonth: month.toString().padStart(2, '0'),
        solDay: day.toString().padStart(2, '0'),
        ServiceKey: SERVICE_KEY,
      },
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    console.error('API 호출 실패:', error);
    throw error;
  }
}

/** API URL + 파라미터 조합 (디버깅/문서용) */
export function getLunPhInfoUrl(year: number, month: number, day: number): string {
  const m = month.toString().padStart(2, '0');
  const d = day.toString().padStart(2, '0');
  return `${LUN_PH_INFO_URL}?solYear=${year}&solMonth=${m}&solDay=${d}&ServiceKey=서비스키`;
}

/** solarTerms/saju에서 사용하는 연도별 절기 형식 */
export type SolarTermsYearData = Record<
  string,
  { name: string; month: number; day: number }
>;

const NAME_TO_KEY: Record<string, string> = {
  소한: 'xiaohan',
  대한: 'dahan',
  입춘: 'lichun',
  우수: 'yushui',
  경칩: 'jingzhe',
  춘분: 'chunfen',
  청명: 'qingming',
  곡우: 'guyu',
  입하: 'lixia',
  소만: 'xiaoman',
  망종: 'mangzhong',
  하지: 'xiazhi',
  소서: 'xiaoshu',
  대서: 'dashu',
  입추: 'liqiu',
  처서: 'chushu',
  백로: 'bailu',
  추분: 'qiufen',
  한로: 'hanlu',
  상강: 'shuangjiang',
  입동: 'lidong',
  소설: 'xiaoxue',
  대설: 'daxue',
  동지: 'dongzhi',
};

/**
 * 특정 연도의 24절기 데이터 수집 (LunPhInfoService)
 * 사주 계산용 SolarTermsYearData 형식 반환
 */
export async function fetchSolarTermsForYear(
  year: number
): Promise<SolarTermsYearData | null> {
  const data = await collectSolarTermsForYearRaw(year);
  if (!data?.length) return null;
  const result: SolarTermsYearData = {};
  for (const item of data) {
    const key = NAME_TO_KEY[item.name];
    if (key) result[key] = { name: item.name, month: item.month, day: item.day };
  }
  return Object.keys(result).length > 0 ? result : null;
}

/**
 * 특정 연도의 24절기 데이터 수집 (내부용 - LunPhInfo API 호출)
 */
async function collectSolarTermsForYearRaw(year: number): Promise<
  { name: string; month: number; day: number }[]
> {
  const solarTermApprox = [
    { name: '소한', month: 1, day: 6 },
    { name: '대한', month: 1, day: 20 },
    { name: '입춘', month: 2, day: 4 },
    { name: '우수', month: 2, day: 19 },
    { name: '경칩', month: 3, day: 6 },
    { name: '춘분', month: 3, day: 21 },
    { name: '청명', month: 4, day: 5 },
    { name: '곡우', month: 4, day: 20 },
    { name: '입하', month: 5, day: 6 },
    { name: '소만', month: 5, day: 21 },
    { name: '망종', month: 6, day: 6 },
    { name: '하지', month: 6, day: 21 },
    { name: '소서', month: 7, day: 7 },
    { name: '대서', month: 7, day: 23 },
    { name: '입추', month: 8, day: 8 },
    { name: '처서', month: 8, day: 23 },
    { name: '백로', month: 9, day: 8 },
    { name: '추분', month: 9, day: 23 },
    { name: '한로', month: 10, day: 8 },
    { name: '상강', month: 10, day: 23 },
    { name: '입동', month: 11, day: 8 },
    { name: '소설', month: 11, day: 22 },
    { name: '대설', month: 12, day: 7 },
    { name: '동지', month: 12, day: 22 },
  ];

  const results: { name: string; month: number; day: number }[] = [];

  for (const term of solarTermApprox) {
    try {
      await fetchLunPhInfo(year, term.month, term.day);
      results.push({
        name: term.name,
        month: term.month,
        day: term.day,
      });
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`${term.name} 데이터 수집 실패:`, error);
      results.push({
        name: term.name,
        month: term.month,
        day: term.day,
      });
    }
  }

  return results;
}
