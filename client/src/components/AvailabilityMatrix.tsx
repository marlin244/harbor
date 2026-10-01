/**
 * Availability Matrix Component
 * Displays a heatmap of resource availability across dates
 */

import React, { useMemo } from 'react';
import { format, eachDayOfInterval, startOfDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import type { Room, Asset, Booking } from '@/types';

interface AvailabilityMatrixProps {
  rooms?: Room[];
  assets?: Asset[];
  bookings?: Booking[];
  startDate: Date;
  endDate: Date;
}

type Resource = (Room | Asset) & { type: 'room' | 'asset' };

export default function AvailabilityMatrix({
  rooms = [],
  assets = [],
  bookings = [],
  startDate,
  endDate,
}: AvailabilityMatrixProps) {
  const resources: Resource[] = useMemo(
    () => [
      ...rooms.map((r) => ({ ...r, type: 'room' as const })),
      ...assets.map((a) => ({ ...a, type: 'asset' as const })),
    ],
    [rooms, assets]
  );

  const dates = useMemo(
    () => eachDayOfInterval({ start: startOfDay(startDate), end: startOfDay(endDate) }),
    [startDate, endDate]
  );

  const getAvailabilityForResource = (resourceId: string, date: Date) => {
    const dayStart = startOfDay(date);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const conflictingBookings = bookings.filter((booking) => {
      const bookingStart = new Date(booking.start);
      const bookingEnd = new Date(booking.end);
      return (
        booking.resourceId === resourceId &&
        bookingStart <= dayEnd &&
        bookingEnd >= dayStart
      );
    });

    return conflictingBookings.length === 0 ? 'available' : 'booked';
  };

  const getColorClass = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-100 hover:bg-emerald-200';
      case 'booked':
        return 'bg-rose-100 hover:bg-rose-200';
      case 'maintenance':
        return 'bg-amber-100 hover:bg-amber-200';
      default:
        return 'bg-muted';
    }
  };

  if (resources.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        Нет ресурсов для отображения матрицы доступности
      </Card>
    );
  }

  return (
    <Card className="p-4 overflow-x-auto">
      <h3 className="font-semibold mb-4">Матрица доступности</h3>

      <div className="inline-block min-w-full">
        {/* Header with dates */}
        <div className="flex gap-1 mb-4">
          <div className="w-32 flex-shrink-0" />
          <div className="flex gap-1">
            {dates.map((date) => (
              <div
                key={date.toISOString()}
                className="w-8 h-8 flex items-center justify-center text-xs font-medium text-muted-foreground"
                title={format(date, 'dd.MM.yyyy')}
              >
                {format(date, 'd')}
              </div>
            ))}
          </div>
        </div>

        {/* Resource rows */}
        {resources.map((resource) => (
          <div key={`${resource.type}-${resource.id}`} className="flex gap-1 mb-2">
            {/* Resource name */}
            <div className="w-32 flex-shrink-0 text-sm font-medium truncate">
              <span className="text-xs px-2 py-1 rounded bg-muted">
                {resource.type === 'room' ? '🏛️' : '📦'} {resource.name}
              </span>
            </div>

            {/* Availability cells */}
            <div className="flex gap-1">
              {dates.map((date) => {
                const availability = getAvailabilityForResource(resource.id, date);
                return (
                  <div
                    key={`${resource.id}-${date.toISOString()}`}
                    className={`
                      w-8 h-8 rounded cursor-pointer transition-colors
                      ${getColorClass(availability)}
                    `}
                    title={`${resource.name} - ${format(date, 'dd.MM.yyyy')}: ${availability === 'available' ? 'Доступно' : 'Забронировано'}`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-6 pt-4 border-t text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-100" />
          <span>Доступно</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-rose-100" />
          <span>Забронировано</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-100" />
          <span>На обслуживании</span>
        </div>
      </div>
    </Card>
  );
}
