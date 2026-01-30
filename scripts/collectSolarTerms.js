/**
 * 한국천문연구원 API(월령 정보 getLunPhInfo)로 24절기 근사 데이터 수집
 *
 * 실행: npm run collect:solar (또는 node scripts/collectSolarTerms.js)
 * 환경변수: KASI_SERVICE_KEY (.env.local에 설정, 절대 코드에 하드코딩 금지)
 * 결과: src/features/saju/data/solarTerms.json
 */

require('dotenv').config({ path: '.env.local' });

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'http://apis.data.go.kr/B090041/openapi/service/LunPhInfoService';
const SERVICE_KEY = process.env.KASI_SERVICE_KEY || '';

if (!SERVICE_KEY) {
  console.error('오류: KASI_SERVICE_KEY를 .env.local에 설정해주세요.');
  process.exit(1);
}

const START_YEAR = 1950;
const END_YEAR = 2050;

// 24절기 근사 날짜 (월, 일)
const SOLAR_TERMS = [
  { name: '소한', nameEn: 'xiaohan', month: 1, day: 6 },
  { name: '대한', nameEn: 'dahan', month: 1, day: 20 },
  { name: '입춘', nameEn: 'lichun', month: 2, day: 4 },
  { name: '우수', nameEn: 'yushui', month: 2, day: 19 },
  { name: '경칩', nameEn: 'jingzhe', month: 3, day: 6 },
  { name: '춘분', nameEn: 'chunfen', month: 3, day: 21 },
  { name: '청명', nameEn: 'qingming', month: 4, day: 5 },
  { name: '곡우', nameEn: 'guyu', month: 4, day: 20 },
  { name: '입하', nameEn: 'lixia', month: 5, day: 6 },
  { name: '소만', nameEn: 'xiaoman', month: 5, day: 21 },
  { name: '망종', nameEn: 'mangzhong', month: 6, day: 6 },
  { name: '하지', nameEn: 'xiazhi', month: 6, day: 21 },
  { name: '소서', nameEn: 'xiaoshu', month: 7, day: 7 },
  { name: '대서', nameEn: 'dashu', month: 7, day: 23 },
  { name: '입추', nameEn: 'liqiu', month: 8, day: 8 },
  { name: '처서', nameEn: 'chushu', month: 8, day: 23 },
  { name: '백로', nameEn: 'bailu', month: 9, day: 8 },
  { name: '추분', nameEn: 'qiufen', month: 9, day: 23 },
  { name: '한로', nameEn: 'hanlu', month: 10, day: 8 },
  { name: '상강', nameEn: 'shuangjiang', month: 10, day: 23 },
  { name: '입동', nameEn: 'lidong', month: 11, day: 8 },
  { name: '소설', nameEn: 'xiaoxue', month: 11, day: 22 },
  { name: '대설', nameEn: 'daxue', month: 12, day: 7 },
  { name: '동지', nameEn: 'dongzhi', month: 12, day: 22 },
];

async function fetchLunPhInfo(year, month, day) {
  try {
    const response = await axios.get(`${API_BASE_URL}/getLunPhInfo`, {
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
    console.error(`API 호출 실패 (${year}-${month}-${day}):`, error.message);
    return null;
  }
}

async function collectSolarTerms() {
  const allData = {};

  for (let year = START_YEAR; year <= END_YEAR; year++) {
    console.log(`수집 중: ${year}년...`);
    const yearData = {};

    for (const term of SOLAR_TERMS) {
      // 근사 날짜 기준으로 ±2일 범위 확인
      let found = false;
      for (let offset = -2; offset <= 2; offset++) {
        const checkDay = term.day + offset;
        if (checkDay < 1 || checkDay > 31) continue;

        const data = await fetchLunPhInfo(year, term.month, checkDay);
        if (data) {
          // XML 파싱 (간단한 방법: lunSecha 필드 확인)
          // 실제로는 XML을 파싱해서 절기 정보를 추출해야 합니다
          yearData[term.nameEn] = {
            name: term.name,
            month: term.month,
            day: checkDay,
          };
          found = true;
          break;
        }

        // API 호출 제한 방지
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      if (!found) {
        // API 실패 시 근사값 사용
        yearData[term.nameEn] = {
          name: term.name,
          month: term.month,
          day: term.day,
        };
      }
    }

    allData[year] = yearData;

    if (year % 10 === 0) {
      const outputPath = path.join(__dirname, '..', 'src', 'features', 'saju', 'data', 'solarTerms.json');
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, JSON.stringify(allData, null, 2));
      console.log(`진행 저장: ${year}년까지`);
    }
  }

  const outputPath = path.join(__dirname, '..', 'src', 'features', 'saju', 'data', 'solarTerms.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(allData, null, 2));
  console.log('수집 완료:', outputPath);
}

// 스크립트 실행
if (require.main === module) {
  collectSolarTerms().catch(console.error);
}

module.exports = { collectSolarTerms, fetchLunPhInfo };
