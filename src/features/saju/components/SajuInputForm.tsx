'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
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

interface SajuInputFormProps {
  onSubmit: (data: {
    year: number;
    month: number;
    day: number;
    hour: number | null;
    calendarType: 'solar' | 'lunar';
    gender: 'male' | 'female';
  }) => void;
}

export function SajuInputForm({ onSubmit }: SajuInputFormProps) {
  const [year, setYear] = useState<string>('');
  const [month, setMonth] = useState<string>('');
  const [day, setDay] = useState<string>('');
  const [hour, setHour] = useState<string>('12');
  const [hourUnknown, setHourUnknown] = useState<boolean>(false);
  const [calendarType, setCalendarType] = useState<'solar' | 'lunar'>('solar');
  const [gender, setGender] = useState<'male' | 'female'>('male');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);
    const dayNum = parseInt(day, 10);
    const hourNum = hourUnknown ? null : parseInt(hour, 10);

    if (
      !year ||
      !month ||
      !day ||
      isNaN(yearNum) ||
      isNaN(monthNum) ||
      isNaN(dayNum) ||
      yearNum < 1900 ||
      yearNum > 2100 ||
      monthNum < 1 ||
      monthNum > 12 ||
      dayNum < 1 ||
      dayNum > 31
    ) {
      alert('올바른 생년월일을 입력해주세요.');
      return;
    }

    if (!hourUnknown && (isNaN(parseInt(hour, 10)) || parseInt(hour, 10) < 0 || parseInt(hour, 10) > 23)) {
      alert('올바른 시간을 입력해주세요.');
      return;
    }

    onSubmit({
      year: yearNum,
      month: monthNum,
      day: dayNum,
      hour: hourNum,
      calendarType,
      gender,
    });
  };

  // 현재 날짜를 기본값으로 설정
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const currentDay = new Date().getDate();

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
          <div className="flex gap-4">
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
                onChange={(e) => setCalendarType(e.target.value as 'solar' | 'lunar')}
                className="w-4 h-4"
              />
              <span className="text-sm">음력</span>
            </label>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 년도 */}
          <div className="space-y-2">
            <Label htmlFor="year">생년 (년)</Label>
            <Input
              id="year"
              type="number"
              placeholder={`예: ${currentYear}`}
              value={year}
              onChange={(e) => setYear(e.target.value)}
              min="1900"
              max="2100"
              required
            />
          </div>

          {/* 월 */}
          <div className="space-y-2">
            <Label htmlFor="month">생월 (월)</Label>
            <Select value={month} onValueChange={setMonth} required>
              <SelectTrigger id="month">
                <SelectValue placeholder="월을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <SelectItem key={m} value={m.toString()}>
                    {m}월
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 일 */}
          <div className="space-y-2">
            <Label htmlFor="day">생일 (일)</Label>
            <Input
              id="day"
              type="number"
              placeholder={`예: ${currentDay}`}
              value={day}
              onChange={(e) => setDay(e.target.value)}
              min="1"
              max="31"
              required
            />
          </div>

          {/* 시간 */}
          <div className="space-y-2">
            <Label htmlFor="hour">생시 (시)</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hourUnknown"
                  checked={hourUnknown}
                  onCheckedChange={(checked) => {
                    setHourUnknown(checked as boolean);
                    if (!checked) {
                      setHour('12');
                    }
                  }}
                />
                <Label htmlFor="hourUnknown" className="cursor-pointer text-sm">
                  태어난 시간을 모릅니다
                </Label>
              </div>
              {!hourUnknown && (
                <Select value={hour} onValueChange={setHour}>
                  <SelectTrigger id="hour">
                    <SelectValue placeholder="시간을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                      <SelectItem key={h} value={h.toString()}>
                        {h}시
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {hourUnknown && (
                <p className="text-xs text-muted-foreground p-2 bg-yellow-50 rounded">
                  시간을 모를 경우 시주 제외하고 계산됩니다.
                </p>
              )}
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full md:w-auto" size="lg">
          사주팔자 보기
        </Button>
      </form>
    </Card>
  );
}
