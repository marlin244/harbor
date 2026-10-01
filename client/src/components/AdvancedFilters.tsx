/**
 * Advanced Filters Component
 * Provides date range filtering, resource type filtering, and status filtering
 */

import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';
import { t } from '@/lib/i18n';

interface AdvancedFiltersProps {
  onDateRangeChange?: (startDate: Date, endDate: Date) => void;
  onResourceTypeChange?: (type: 'all' | 'room' | 'asset') => void;
  onStatusChange?: (status: 'all' | 'available' | 'unavailable' | 'maintenance') => void;
  onApply?: (filters: FilterState) => void;
}

export interface FilterState {
  startDate: Date;
  endDate: Date;
  resourceType: 'all' | 'room' | 'asset';
  status: 'all' | 'available' | 'unavailable' | 'maintenance';
}

export default function AdvancedFilters({
  onDateRangeChange,
  onResourceTypeChange,
  onStatusChange,
  onApply,
}: AdvancedFiltersProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(today);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(addMonths(today, 1));
  const [resourceType, setResourceType] = useState<'all' | 'room' | 'asset'>('all');
  const [status, setStatus] = useState<'all' | 'available' | 'unavailable' | 'maintenance'>('all');
  const [showCalendar, setShowCalendar] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handlePreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleDateSelect = (date: Date) => {
    if (!selectedStartDate) {
      setSelectedStartDate(date);
      return;
    }

    if (!selectedEndDate) {
      if (date > selectedStartDate) {
        setSelectedEndDate(date);
        onDateRangeChange?.(selectedStartDate, date);
      } else {
        setSelectedStartDate(date);
        setSelectedEndDate(null);
      }
      return;
    }

    // Reset selection
    setSelectedStartDate(date);
    setSelectedEndDate(null);
  };

  const handleApplyFilters = () => {
    if (selectedStartDate && selectedEndDate) {
      onApply?.({
        startDate: selectedStartDate,
        endDate: selectedEndDate,
        resourceType,
        status,
      });
      setShowCalendar(false);
    }
  };

  const handleClearFilters = () => {
    setSelectedStartDate(today);
    setSelectedEndDate(addMonths(today, 1));
    setResourceType('all');
    setStatus('all');
  };

  const isDateInRange = (date: Date) => {
    if (!selectedStartDate || !selectedEndDate) return false;
    return date >= selectedStartDate && date <= selectedEndDate;
  };

  const isDateStart = (date: Date) => selectedStartDate && isSameDay(date, selectedStartDate);
  const isDateEnd = (date: Date) => selectedEndDate && isSameDay(date, selectedEndDate);

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <div className="w-full space-y-4">
      {/* Filter Summary */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {t('importData')} / {t('data')}
          </h3>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="text-sm text-primary hover:text-primary/80"
          >
            {showCalendar ? 'Скрыть' : 'Показать'} календарь
          </button>
        </div>

        {/* Selected Range Display */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-muted-foreground">Начало периода</label>
            <div className="text-sm font-medium">
              {selectedStartDate ? format(selectedStartDate, 'dd.MM.yyyy') : 'Не выбрано'}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Конец периода</label>
            <div className="text-sm font-medium">
              {selectedEndDate ? format(selectedEndDate, 'dd.MM.yyyy') : 'Не выбрано'}
            </div>
          </div>
        </div>

        {/* Resource Type Filter */}
        <div className="mb-4">
          <label className="text-xs text-muted-foreground mb-2 block">Тип ресурса</label>
          <div className="flex gap-2">
            {(['all', 'room', 'asset'] as const).map((type) => (
              <Button
                key={type}
                variant={resourceType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setResourceType(type);
                  onResourceTypeChange?.(type);
                }}
              >
                {type === 'all' ? 'Все' : type === 'room' ? 'Аудитории' : 'Инвентарь'}
              </Button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div className="mb-4">
          <label className="text-xs text-muted-foreground mb-2 block">Статус</label>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'available', 'unavailable', 'maintenance'] as const).map((s) => (
              <Button
                key={s}
                variant={status === s ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setStatus(s);
                  onStatusChange?.(s);
                }}
              >
                {s === 'all'
                  ? 'Все'
                  : s === 'available'
                    ? 'Доступно'
                    : s === 'unavailable'
                      ? 'Недоступно'
                      : 'На обслуживании'}
              </Button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleApplyFilters} className="flex-1">
            Применить
          </Button>
          <Button onClick={handleClearFilters} variant="outline" className="flex-1">
            Очистить
          </Button>
        </div>
      </Card>

      {/* Calendar */}
      {showCalendar && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={handlePreviousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h4 className="font-semibold">
              {format(currentMonth, 'LLLL yyyy', { locale: ru })}
            </h4>
            <Button variant="ghost" size="sm" onClick={handleNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: monthStart.getDay() || 6 }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Days of month */}
            {daysInMonth.map((date) => {
              const isStart = isDateStart(date);
              const isEnd = isDateEnd(date);
              const inRange = isDateInRange(date);

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDateSelect(date)}
                  className={`
                    aspect-square rounded text-xs font-medium transition-colors
                    ${isStart || isEnd ? 'bg-primary text-primary-foreground' : inRange ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}
                  `}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
