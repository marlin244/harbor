/**
 * Booking timeline/schedule view
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ChevronLeft, ChevronRight, Trash2, Edit2, Calendar } from 'lucide-react';
import { formatUTCForDisplay, getStartOfDay, addMinutes } from '@/lib/timeUtils';
import { t } from '@/lib/i18n';
import type { Booking } from '@/types';

interface BookingTimelineProps {
  onEditBooking?: (booking: Booking) => void;
  onDeleteBooking?: (bookingId: string) => void;
  onDeleteSeries?: (seriesId: string) => void;
}

export function BookingTimeline({ onEditBooking, onDeleteBooking, onDeleteSeries }: BookingTimelineProps) {
  const { bookings, rooms, assets } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date().toISOString());
  const [seriesDeleteTarget, setSeriesDeleteTarget] = useState<Booking | null>(null);

  const dayStart = getStartOfDay(currentDate);
  const dayEnd = addMinutes(dayStart, 24 * 60);

  // Get bookings for the current day
  const dayBookings = useMemo(() => {
    return bookings
      .filter((booking) => {
        const bookingStart = new Date(booking.start).getTime();
        const dayStartTime = new Date(dayStart).getTime();
        const dayEndTime = new Date(dayEnd).getTime();
        return bookingStart >= dayStartTime && bookingStart < dayEndTime;
      })
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  }, [bookings, dayStart, dayEnd]);

  const getResourceName = (booking: Booking): string => {
    if (booking.resourceType === 'room') {
      return rooms.find((r) => r.id === booking.resourceId)?.name || `${t('room')} ${booking.resourceId}`;
    } else {
      return assets.find((a) => a.id === booking.resourceId)?.name || `${t('asset')} ${booking.resourceId}`;
    }
  };

  const handlePrevDay = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    setCurrentDate(prev.toISOString());
  };

  const handleNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next.toISOString());
  };

  const handleToday = () => {
    setCurrentDate(new Date().toISOString());
  };

  const dateStr = new Date(currentDate).toLocaleDateString('ru-RU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-accent p-4 rounded-xl">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="font-semibold text-foreground">{dateStr}</span>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevDay}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            {t('previousDay')}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleToday}
          >
            {t('today')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextDay}
            className="flex items-center gap-2"
          >
            {t('nextDay')}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {dayBookings.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>{t('noBookingsForDay')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dayBookings.map((booking) => (
            <Card key={booking.id} className="hover:border-primary/50 hover:shadow-sm transition">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{booking.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                      <Badge variant="secondary">{getResourceName(booking)}</Badge>
                      {booking.status === 'pending' && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          {t('awaitingApproval')}
                        </Badge>
                      )}
                      {booking.status === 'cancelled' && (
                        <Badge variant="outline" className="text-muted-foreground">
                          {t('cancelledStatus')}
                        </Badge>
                      )}
                      {booking.seriesId && booking.seriesIndex && booking.seriesTotal && (
                        <Badge variant="outline">
                          Серия {booking.seriesIndex}/{booking.seriesTotal}
                        </Badge>
                      )}
                      <span>
                        {formatUTCForDisplay(booking.start)} - {new Date(booking.end).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {onEditBooking && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditBooking(booking)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    )}
                    {onDeleteBooking && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (booking.seriesId && onDeleteSeries) {
                            setSeriesDeleteTarget(booking);
                            return;
                          }
                          if (confirm(t('deleteConfirm'))) {
                            onDeleteBooking(booking.id);
                          }
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              {booking.notes && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">{t('notes')}:</span> {booking.notes}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!seriesDeleteTarget} onOpenChange={(open) => !open && setSeriesDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{seriesDeleteTarget?.title}</AlertDialogTitle>
            <AlertDialogDescription>{t('deleteConfirm')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (seriesDeleteTarget) onDeleteBooking?.(seriesDeleteTarget.id);
              }}
            >
              {t('deleteThisOccurrence')}
            </AlertDialogAction>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                if (seriesDeleteTarget?.seriesId) onDeleteSeries?.(seriesDeleteTarget.seriesId);
              }}
            >
              {t('deleteEntireSeries')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
