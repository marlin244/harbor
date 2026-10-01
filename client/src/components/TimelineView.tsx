/**
 * Timeline View Component
 * Displays bookings in a Gantt-like timeline format
 */

import React, { useMemo } from 'react';
import { format, startOfDay, eachHourOfInterval, addHours, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Room, Asset, Booking } from '@/types';

interface TimelineViewProps {
  rooms?: Room[];
  assets?: Asset[];
  bookings?: Booking[];
  selectedDate: Date;
  onDateChange?: (date: Date) => void;
  onBookingClick?: (booking: Booking) => void;
}

type Resource = (Room | Asset) & { type: 'room' | 'asset' };

export default function TimelineView({
  rooms = [],
  assets = [],
  bookings = [],
  selectedDate,
  onDateChange,
  onBookingClick,
}: TimelineViewProps) {
  const resources: Resource[] = useMemo(
    () => [
      ...rooms.map((r) => ({ ...r, type: 'room' as const })),
      ...assets.map((a) => ({ ...a, type: 'asset' as const })),
    ],
    [rooms, assets]
  );

  const hours = useMemo(() => {
    const start = startOfDay(selectedDate);
    return eachHourOfInterval({
      start,
      end: addHours(start, 23),
    });
  }, [selectedDate]);

  const getBookingsForResource = (resourceId: string) => {
    return bookings.filter(
      (b) => b.resourceId === resourceId && isSameDay(new Date(b.start), selectedDate)
    );
  };

  const getBookingPosition = (booking: Booking) => {
    const bookingStart = new Date(booking.start);
    const dayStart = startOfDay(selectedDate);
    const minutesFromStart = (bookingStart.getTime() - dayStart.getTime()) / (1000 * 60);
    return (minutesFromStart / 60) * 100; // Convert to percentage
  };

  const getBookingDuration = (booking: Booking) => {
    const start = new Date(booking.start);
    const end = new Date(booking.end);
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    return (durationMinutes / 1440) * 100; // Percentage of day
  };

  const handlePreviousDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    onDateChange?.(prev);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    onDateChange?.(next);
  };

  if (resources.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        Нет ресурсов для отображения расписания
      </Card>
    );
  }

  return (
    <Card className="p-4">
      {/* Date Navigation */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <Button variant="ghost" size="sm" onClick={handlePreviousDay}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h3 className="font-semibold">
          {format(selectedDate, 'EEEE, dd MMMM yyyy', { locale: ru })}
        </h3>
        <Button variant="ghost" size="sm" onClick={handleNextDay}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Timeline Grid */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Hour Headers */}
          <div className="flex gap-1 mb-2">
            <div className="w-32 flex-shrink-0" />
            <div className="flex gap-1">
              {hours.map((hour) => (
                <div
                  key={hour.toISOString()}
                  className="w-20 text-center text-xs font-medium text-muted-foreground"
                >
                  {format(hour, 'HH:mm')}
                </div>
              ))}
            </div>
          </div>

          {/* Resources and their bookings */}
          {resources.map((resource) => {
            const resourceBookings = getBookingsForResource(resource.id);

            return (
              <div key={`${resource.type}-${resource.id}`} className="flex gap-1 mb-4">
                {/* Resource name */}
                <div className="w-32 flex-shrink-0">
                  <div className="text-sm font-medium truncate px-2 py-2">
                    <span className="text-xs px-2 py-1 rounded bg-muted">
                      {resource.type === 'room' ? '🏛️' : '📦'} {resource.name}
                    </span>
                  </div>
                </div>

                {/* Timeline */}
                <div className="flex-1 relative bg-muted/60 rounded h-12 border border-border">
                  {/* Hour dividers */}
                  {hours.map((_, i) => (
                    <div
                      key={`divider-${i}`}
                      className="absolute top-0 bottom-0 w-px bg-border"
                      style={{ left: `${(i / hours.length) * 100}%` }}
                    />
                  ))}

                  {/* Bookings */}
                  {resourceBookings.map((booking) => {
                    const left = getBookingPosition(booking);
                    const width = getBookingDuration(booking);

                    return (
                      <div
                        key={booking.id}
                        onClick={() => onBookingClick?.(booking)}
                        className="absolute top-1 bottom-1 bg-primary text-primary-foreground rounded px-2 py-1 cursor-pointer hover:bg-primary/90 transition-colors overflow-hidden"
                        style={{
                          left: `${left}%`,
                          width: `${Math.max(width, 5)}%`, // Minimum width for visibility
                        }}
                        title={`${booking.title}\n${format(new Date(booking.start), 'HH:mm')} - ${format(new Date(booking.end), 'HH:mm')}`}
                      >
                        <div className="text-xs truncate font-medium">{booking.title}</div>
                        <div className="text-xs truncate opacity-90">
                          {format(new Date(booking.start), 'HH:mm')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
        Нажмите на бронирование для редактирования
      </div>
    </Card>
  );
}
