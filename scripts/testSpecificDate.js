// 1992-06-26 일주 검증

function toJulianDay(year, month, day) {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + B - 1524.5;
}

function toJDN(year, month, day) {
  return Math.floor(toJulianDay(year, month, day) + 0.5);
}

const TEN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const TWELVE_JI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 2024-01-01 = 甲子日
const BASE_JDN = 2460311;

const jdn = toJDN(1992, 6, 26);
const diff = jdn - BASE_JDN;
const cycle60 = ((diff % 60) + 60) % 60;
const gan = cycle60 % 10;
const ji = cycle60 % 12;

console.log('1992-06-26 계산 결과:');
console.log('JDN:', jdn);
console.log('BASE_JDN과의 차이:', diff);
console.log('cycle60:', cycle60);
console.log('일주:', TEN_GAN[gan] + TWELVE_JI[ji]);
