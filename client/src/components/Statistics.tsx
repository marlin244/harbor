/**
 * Statistics Component
 * Displays analytics and usage statistics with charts
 */

import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, startOfDay, eachDayOfInterval } from 'date-fns';
import type { Room, Asset, Booking } from '@/types';

interface StatisticsProps {
  rooms?: Room[];
  assets?: Asset[];
  bookings?: Booking[];
  startDate: Date;
  endDate: Date;
}

export default function Statistics({
  rooms = [],
  assets = [],
  bookings = [],
  startDate,
  endDate,
}: StatisticsProps) {
  const stats = useMemo(() => {
    const totalResources = rooms.length + assets.length;
    const totalBookings = bookings.length;

    // Bookings per day
    const dates = eachDayOfInterval({ start: startOfDay(startDate), end: startOfDay(endDate) });
    const bookingsPerDay = dates.map((date) => {
      const dayStart = startOfDay(date);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayBookings = bookings.filter((b) => {
        const bStart = new Date(b.start);
        const bEnd = new Date(b.end);
        return bStart <= dayEnd && bEnd >= dayStart;
      });

      return {
        date: format(date, 'dd.MM'),
        bookings: dayBookings.length,
      };
    });

    // Resource usage
    const resourceUsage = [...rooms, ...assets].map((resource) => {
      const resourceBookings = bookings.filter((b) => b.resourceId === resource.id);
      return {
        name: resource.name,
        bookings: resourceBookings.length,
      };
    });

    // Booking type distribution
    const roomBookings = bookings.filter((b) => b.resourceType === 'room').length;
    const assetBookings = bookings.filter((b) => b.resourceType === 'asset').length;

    // Average booking duration
    const avgDuration =
      bookings.length > 0
        ? bookings.reduce((sum, b) => {
            const start = new Date(b.start);
            const end = new Date(b.end);
            return sum + (end.getTime() - start.getTime()) / (1000 * 60); // minutes
          }, 0) / bookings.length
        : 0;

    return {
      totalResources,
      totalBookings,
      bookingsPerDay,
      resourceUsage,
      bookingTypeDistribution: [
        { name: 'Аудитории', value: roomBookings },
        { name: 'Инвентарь', value: assetBookings },
      ],
      avgDuration: Math.round(avgDuration),
    };
  }, [rooms, assets, bookings, startDate, endDate]);

  const COLORS = ['#7c3aed', '#e11d48', '#059669', '#d97706'];

  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Всего ресурсов</div>
          <div className="text-2xl font-bold">{stats.totalResources}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Всего броней</div>
          <div className="text-2xl font-bold">{stats.totalBookings}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Средняя длительность</div>
          <div className="text-2xl font-bold">{stats.avgDuration} мин</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Коэффициент использования</div>
          <div className="text-2xl font-bold">
            {stats.totalResources > 0
              ? Math.round((stats.totalBookings / (stats.totalResources * stats.bookingsPerDay.length)) * 100)
              : 0}
            %
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bookings per day */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Брони по дням</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.bookingsPerDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="bookings" stroke="#7c3aed" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Booking type distribution */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Распределение по типам</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.bookingTypeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#7c3aed"
                dataKey="value"
              >
                {stats.bookingTypeDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Resource usage */}
        {stats.resourceUsage.length > 0 && (
          <Card className="p-4 lg:col-span-2">
            <h3 className="font-semibold mb-4">Использование ресурсов</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.resourceUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="#7c3aed" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>
    </div>
  );
}
