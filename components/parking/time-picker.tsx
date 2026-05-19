"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  startTime: Date | null;
  endTime: Date | null;
  onStartTimeChange: (date: Date) => void;
  onEndTimeChange: (date: Date) => void;
}

export function TimePicker({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
}: TimePickerProps) {
  const now = new Date();

  // 내일(+1) ~ +6일까지 6일치
  const dates = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    return date;
  });

  // +2일, +3일은 아직 오픈되지 않은 날짜 - disabled 처리
  const isDisabledDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff === 2 || diff === 3;
  };

  // 초기 선택 날짜: 첫 번째 활성화된 날짜 (내일)
  const [selectedDate, setSelectedDate] = useState<Date>(dates[0]);
  const [startHour, setStartHour] = useState<number>(0);
  const [duration, setDuration] = useState<number>(1);

  const DURATION_OPTIONS = [1, 2, 3, 4, 5, 6, 8, 12];

  // 0~21시만 허용 (종료 시간이 최대 22시)
  const hours = Array.from({ length: 22 }, (_, i) => i);

  // startHour 기준으로 종료 시간이 22시 이하인 duration만 허용
  const availableDurations = DURATION_OPTIONS.filter(
    (d) => startHour + d <= 22
  );

  // startHour 변경 시 duration이 범위 벗어나면 초기화
  useEffect(() => {
    if (startHour + duration > 22) {
      setDuration(availableDurations[0] ?? 1);
    }
  }, [startHour]);

  const formatDate = (date: Date) => {
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) return "내일";
    return `${month}/${day}(${days[date.getDay()]})`;
  };

  useEffect(() => {
    const start = new Date(selectedDate);
    start.setHours(startHour, 0, 0, 0);
    const end = new Date(start.getTime() + duration * 60 * 60 * 1000);
    onStartTimeChange(start);
    onEndTimeChange(end);
  }, [selectedDate, startHour, duration, onStartTimeChange, onEndTimeChange]);

  return (
    <div className="space-y-6">
      {/* 날짜 선택 */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium mb-3">
          <Calendar className="w-4 h-4" /> 날짜 선택
        </label>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {dates.map((date) => {
            const disabled = isDisabledDate(date);
            return (
              <button
                key={date.toISOString()}
                onClick={() => !disabled && setSelectedDate(date)}
                disabled={disabled}
                className={cn(
                  "px-4 py-3 rounded-xl text-sm font-medium transition-all min-w-[80px]",
                  disabled
                    ? "bg-muted text-muted-foreground opacity-40 cursor-not-allowed"
                    : selectedDate.toDateString() === date.toDateString()
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {formatDate(date)}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          ※ 비활성화된 날짜는 전날 22시에 오픈됩니다.
        </p>
      </div>

      {/* 시작 시간 선택 */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium mb-3">
          <Clock className="w-4 h-4" /> 시작 시간
        </label>
        <div className="flex gap-2">
          <select
            value={startHour}
            onChange={(e) => setStartHour(Number(e.target.value))}
            className="flex-1 h-11 px-4 rounded-lg border bg-background"
          >
            {hours.map((h) => (
              <option key={h} value={h}>
                {h.toString().padStart(2, "0")}시
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 이용 시간 버튼 */}
      <div>
        <label className="text-sm font-medium mb-3 block">이용 시간</label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {availableDurations.map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                duration === d
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {`${d}시간`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}