/**
 * Booking creation and editing form with conflict detection
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { t } from '@/lib/i18n';
import type { Booking, ResourceType } from '@/types';
import { validateBooking } from '@/lib/bookingUtils';
import { formatUTCForDateInput, formatUTCForTimeInput, parseLocalToUTC, getNowUTC, addDays } from '@/lib/timeUtils';

type RepeatMode = 'none' | 'daily' | 'weekly';

interface SeriesConflict {
  date: string;
  conflicts: string[];
}

interface BookingFormProps {
  booking?: Booking;
  onSubmit: (booking: Booking) => void;
  onSubmitSeries?: (bookings: Booking[]) => void;
  onCancel: () => void;
}

export function BookingForm({ booking, onSubmit, onSubmitSeries, onCancel }: BookingFormProps) {
  const { rooms, assets, bookings } = useApp();
  const [resourceType, setResourceType] = useState<ResourceType>(booking?.resourceType || 'room');
  const [resourceId, setResourceId] = useState(booking?.resourceId || '');
  const [title, setTitle] = useState(booking?.title || '');
  const [date, setDate] = useState(booking ? formatUTCForDateInput(booking.start) : '');
  const [startTime, setStartTime] = useState(booking ? formatUTCForTimeInput(booking.start) : '');
  const [endTime, setEndTime] = useState(booking ? formatUTCForTimeInput(booking.end) : '');
  const [notes, setNotes] = useState(booking?.notes || '');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(null);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('none');
  const [repeatCount, setRepeatCount] = useState(3);
  const [seriesConflicts, setSeriesConflicts] = useState<SeriesConflict[] | null>(null);

  const resources = resourceType === 'room' ? rooms : assets;

  useEffect(() => {
    setSeriesConflicts(null);
  }, [repeatMode, repeatCount]);

  // Validate on form change
  useEffect(() => {
    setSeriesConflicts(null);

    if (!resourceId || !date || !startTime || !endTime) {
      setValidationResult(null);
      return;
    }

    try {
      const startISO = parseLocalToUTC(date, startTime);
      const endISO = parseLocalToUTC(date, endTime);

      const testBooking: Booking = {
        id: booking?.id || 'temp',
        resourceType,
        resourceId,
        title,
        start: startISO,
        end: endISO,
        notes,
      };

      const resourceBookings = bookings.filter(
        (b) => b.resourceType === resourceType && b.resourceId === resourceId
      );

      const result = validateBooking(testBooking, resourceBookings);
      setValidationResult(result);
    } catch (error) {
      setValidationResult(null);
    }
  }, [resourceType, resourceId, date, startTime, endTime, title, notes, booking, bookings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validationResult?.valid) {
      return;
    }

    if (!booking && repeatMode !== 'none' && onSubmitSeries) {
      handleSubmitSeries();
      return;
    }

    const startISO = parseLocalToUTC(date, startTime);
    const endISO = parseLocalToUTC(date, endTime);

    const newBooking: Booking = {
      id: booking?.id || `booking-${Date.now()}`,
      resourceType,
      resourceId,
      title,
      start: startISO,
      end: endISO,
      notes,
    };

    onSubmit(newBooking);
  };

  const handleSubmitSeries = () => {
    const resource = resources.find((r) => r.id === resourceId);
    const seriesId = `series-${Date.now()}`;
    const stepDays = repeatMode === 'weekly' ? 7 : 1;

    const baseStartISO = parseLocalToUTC(date, startTime);
    const baseEndISO = parseLocalToUTC(date, endTime);

    const occurrences: Booking[] = Array.from({ length: repeatCount }, (_, i) => ({
      id: `${seriesId}-${i + 1}`,
      resourceType,
      resourceId,
      title,
      start: addDays(baseStartISO, i * stepDays),
      end: addDays(baseEndISO, i * stepDays),
      notes,
      status: resource?.requiresApproval ? 'pending' : 'confirmed',
      seriesId,
      seriesIndex: i + 1,
      seriesTotal: repeatCount,
    }));

    const resourceBookings = bookings.filter(
      (b) => b.resourceType === resourceType && b.resourceId === resourceId
    );

    const failures: SeriesConflict[] = [];
    const alreadyAccepted: Booking[] = [];

    for (const occurrence of occurrences) {
      const result = validateBooking(occurrence, [...resourceBookings, ...alreadyAccepted]);
      if (!result.valid) {
        failures.push({
          date: formatUTCForDateInput(occurrence.start),
          conflicts: result.conflicts.map((c: any) => c.booking.title || c.conflictReason),
        });
      } else {
        alreadyAccepted.push(occurrence);
      }
    }

    if (failures.length > 0) {
      setSeriesConflicts(failures);
      return;
    }

    setSeriesConflicts(null);
    onSubmitSeries?.(occurrences);
  };

  const handleUseSuggestion = (index: number) => {
    if (!validationResult?.suggestedSlots || !validationResult.suggestedSlots[index]) {
      return;
    }

    const slot = validationResult.suggestedSlots[index];
    const startDate = new Date(slot.start);
    const endDate = new Date(slot.end);

    const newDate = startDate.toISOString().split('T')[0];
    const newStartTime = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
    const newEndTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;

    setDate(newDate);
    setStartTime(newStartTime);
    setEndTime(newEndTime);
    setSelectedSuggestion(index);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="resourceType">{t('resourceType')}</Label>
          <Select value={resourceType} onValueChange={(value) => setResourceType(value as ResourceType)}>
            <SelectTrigger id="resourceType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="room">{t('room')}</SelectItem>
              <SelectItem value="asset">{t('asset')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="resourceId">{resourceType === 'room' ? t('selectRoom') : t('selectAsset')}</Label>
          <Select value={resourceId} onValueChange={setResourceId}>
            <SelectTrigger id="resourceId">
              <SelectValue placeholder="Выберите..." />
            </SelectTrigger>
            <SelectContent>
              {resources.map((resource) => (
                <SelectItem key={resource.id} value={resource.id}>
                  {resource.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="title">{t('title')}</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('bookingTitle')}
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="date">{t('date')}</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="startTime">{t('startTime')}</Label>
          <Input
            id="startTime"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="endTime">{t('endTime')}</Label>
          <Input
            id="endTime"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">{t('notes')}</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t('addNotes')}
          rows={3}
        />
      </div>

      {!booking && onSubmitSeries && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="repeatMode">{t('repeat')}</Label>
            <Select value={repeatMode} onValueChange={(value) => setRepeatMode(value as RepeatMode)}>
              <SelectTrigger id="repeatMode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('repeatNone')}</SelectItem>
                <SelectItem value="daily">{t('repeatDaily')}</SelectItem>
                <SelectItem value="weekly">{t('repeatWeekly')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {repeatMode !== 'none' && (
            <div>
              <Label htmlFor="repeatCount">{t('repeatCount')}</Label>
              <Input
                id="repeatCount"
                type="number"
                min={2}
                max={12}
                value={repeatCount}
                onChange={(e) => setRepeatCount(Math.min(12, Math.max(2, parseInt(e.target.value, 10) || 2)))}
              />
            </div>
          )}
        </div>
      )}

      {seriesConflicts && (
        <div className="border border-rose-200 bg-rose-50 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <h3 className="font-semibold text-rose-900">{t('seriesConflictDetected')}</h3>
          </div>
          <ul className="space-y-1">
            {seriesConflicts.map((failure, idx) => (
              <li key={idx} className="text-sm text-rose-700">
                • {failure.date}: {failure.conflicts.join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}

      {validationResult && !validationResult.valid && (
        <div className="border border-rose-200 bg-rose-50 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <h3 className="font-semibold text-rose-900">{t('conflictDetected')}</h3>
          </div>

          <div className="mb-3">
            <p className="text-sm text-rose-800 mb-2">{t('conflictsWith')}</p>
            <ul className="space-y-1">
              {validationResult.conflicts.map((conflict: any, idx: number) => (
                <li key={idx} className="text-sm text-rose-700">
                  • {conflict.booking.title}
                </li>
              ))}
            </ul>
          </div>

          {validationResult.suggestedSlots && validationResult.suggestedSlots.length > 0 && (
            <div>
              <p className="text-sm font-medium text-rose-900 mb-2">{t('suggestedSlots')}</p>
              <div className="space-y-2">
                {validationResult.suggestedSlots.map((slot: any, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleUseSuggestion(idx)}
                    className="w-full text-left p-2 bg-card border border-rose-200 rounded-lg hover:bg-rose-100 transition text-sm"
                  >
                    {new Date(slot.start).toLocaleString('ru-RU')} - {new Date(slot.end).toLocaleTimeString('ru-RU')}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {validationResult && validationResult.valid && (
        <div className="border border-emerald-200 bg-emerald-50 p-4 rounded-xl flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <p className="text-sm text-emerald-800">{t('noConflicts')}</p>
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('cancel')}
        </Button>
        <Button type="submit" disabled={!validationResult?.valid}>
          {booking
            ? t('updateBooking')
            : repeatMode !== 'none' && onSubmitSeries
              ? t('createSeriesButton')
              : t('createBooking')}
        </Button>
      </div>
    </form>
  );
}
