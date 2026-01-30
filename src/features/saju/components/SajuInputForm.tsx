'use client';

import { useState, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from 'lucide-react';
import { JI_HOUR_SELECTIONS } from '../constants/ganji';

const YEAR_MIN = 1900;
const YEAR_MAX = 2100;

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

interface SajuInputFormProps {
  onSubmit: (data: {
    year: number;
    month: number;
    day: number;
    hour: number | null;
    minute: number;
    calendarType: 'solar' | 'lunar';
    isIntercalation?: boolean;
    gender: 'male' | 'female';
  }) => void | Promise<void>;
  isLoading?: boolean;
}

export function SajuInputForm({ onSubmit, isLoading = false }: SajuInputFormProps) {
  const [year, setYear] = useState<string>(() => {
    const d = new Date();
    return d.getFullYear().toString();
  });
  const [month, setMonth] = useState<string>(() => {
    const d = new Date();
    return (d.getMonth() + 1).toString();
  });
  const [day, setDay] = useState<string>(() => {
    const d = new Date();
    return d.getDate().toString();
  });
  const [jiIndex, setJiIndex] = useState<string>('6');
  const [hourUnknown, setHourUnknown] = useState<boolean>(false);
  const [calendarType, setCalendarType] = useState<'solar' | 'lunar'>('solar');
  const [isIntercalation, setIsIntercalation] = useState<boolean>(false);
  const [gender, setGender] = useState<'male' | 'female'>('male');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);
    const dayNum = parseInt(day, 10);
    const ji = parseInt(jiIndex, 10);

    const maxDay = calendarType === 'lunar' ? 30 : getDaysInMonth(yearNum, monthNum);
    if (
      !year ||
      !month ||
      !day ||
      isNaN(yearNum) ||
      isNaN(monthNum) ||
      isNaN(dayNum) ||
      yearNum < YEAR_MIN ||
      yearNum > YEAR_MAX ||
      monthNum < 1 ||
      monthNum > 12 ||
      dayNum < 1 ||
      dayNum > maxDay
    ) {
      alert('올바른 생년월일을 선택해주세요.');
      return;
    }

    if (!hourUnknown && (isNaN(ji) || ji < 0 || ji > 11)) {
      alert('올바른 생시를 선택해주세요.');
      return;
    }

    let hourNum: number | null = null;
    let minuteNum = 0;
    if (!hourUnknown) {
      const sel = JI_HOUR_SELECTIONS[ji];
      hourNum = sel.hour;
      minuteNum = sel.minute;
    }

    onSubmit({
      year: yearNum,
      month: monthNum,
      day: dayNum,
      hour: hourNum,
      minute: minuteNum,
      calendarType,
      isIntercalation: calendarType === 'lunar' ? isIntercalation : undefined,
      gender,
    });
  };

  const fallback = new Date();
  const currentYear = fallback.getFullYear();
  const currentMonth = fallback.getMonth() + 1;

  const y = year ? parseInt(year, 10) : currentYear;
  const m = month ? parseInt(month, 10) : currentMonth;
  const daysInMonth = useMemo(
    () => (calendarType === 'lunar' ? 30 : getDaysInMonth(y, m)),
    [calendarType, y, m]
  );

  const onMonthChange = (v: string) => {
    setMonth(v);
    if (!day) return;
    const maxD = getDaysInMonth(y, parseInt(v, 10));
    if (parseInt(day, 10) > maxD) setDay(maxD.toString());
  };

  const onYearChange = (v: string) => {
    setYear(v);
    if (!day) return;
    const maxD = getDaysInMonth(parseInt(v, 10), m);
    if (parseInt(day, 10) > maxD) setDay(maxD.toString());
  };

  return (
    <Card className="p-6 md:p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold">생년월일시 입력</h2>
        </div>

        {/* 음력/양력 선택 */}
        <div className="space-y-2">
          <Label>달력 구분</Label>
          <div className="flex flex-wrap gap-4 items-center">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="calendarType"
                value="solar"
                checked={calendarType === 'solar'}
                onChange={(e) => setCalendarType(e.target.value as 'solar' | 'lunar')}
                className="w-4 h-4"
              />
              <span className="text-sm">양력</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="calendarType"
                value="lunar"
                checked={calendarType === 'lunar'}
                onChange={(e) => {
                  setCalendarType(e.target.value as 'solar' | 'lunar');
                  if (day && parseInt(day, 10) > 30) setDay('30');
                }}
                className="w-4 h-4"
              />
              <span className="text-sm">음력</span>
            </label>
            {calendarType === 'lunar' && (
              <label className="flex items-center space-x-2 cursor-pointer">
                <Checkbox
                  checked={isIntercalation}
                  onCheckedChange={(c) => setIsIntercalation(c === true)}
                />
                <span className="text-sm">윤달</span>
              </label>
            )}
          </div>
        </div>

        {/* 성별 선택 */}
        <div className="space-y-2">
          <Label>성별</Label>
          <div className="flex gap-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="male"
                checked={gender === 'male'}
                onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                className="w-4 h-4"
              />
              <span className="text-sm">남성</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={gender === 'female'}
                onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                className="w-4 h-4"
              />
              <span className="text-sm">여성</span>
            </label>
          </div>
        </div>

        {/* 생년월일 한 줄 */}
        <div className="space-y-2">
          <Label>생년월일</Label>
          <div className="flex flex-wrap gap-2">
            <Select value={year} onValueChange={onYearChange} required>
              <SelectTrigger id="year" className="w-[100px]">
                <SelectValue placeholder="년" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: YEAR_MAX - YEAR_MIN + 1 }, (_, i) => YEAR_MIN + i).map((n) => (
                  <SelectItem key={n} value={n.toString()}>
                    {n}년
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={month} onValueChange={onMonthChange} required>
              <SelectTrigger id="month" className="w-[90px]">
                <SelectValue placeholder="월" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                  <SelectItem key={n} value={n.toString()}>
                    {n}월
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={day} onValueChange={setDay} required>
              <SelectTrigger id="day" className="w-[90px]">
                <SelectValue placeholder="일" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((n) => (
                  <SelectItem key={n} value={n.toString()}>
                    {n}일
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 생시 한 줄 */}
        <div className="space-y-2">
          <Label>생시</Label>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hourUnknown"
                checked={hourUnknown}
                onCheckedChange={(checked) => {
                  setHourUnknown(checked as boolean);
                  if (!checked) setJiIndex('6');
                }}
              />
              <Label htmlFor="hourUnknown" className="cursor-pointer text-sm">
                시간 모름
              </Label>
            </div>
            {!hourUnknown && (
              <Select value={jiIndex} onValueChange={setJiIndex}>
                <SelectTrigger id="ji" className="w-[200px]">
                  <SelectValue placeholder="時 선택" />
                </SelectTrigger>
                <SelectContent>
                  {JI_HOUR_SELECTIONS.map((s) => (
                    <SelectItem key={s.jiIndex} value={s.jiIndex.toString()}>
                      {s.nameKo}시 {s.range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {!hourUnknown && (
              <span className="text-xs text-muted-foreground">자시 00:00~</span>
            )}
            {hourUnknown && (
              <span className="text-xs text-muted-foreground">시주 제외 계산</span>
            )}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full md:w-auto"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? '계산 중...' : '사주팔자 보기'}
        </Button>
      </form>
    </Card>
  );
}
