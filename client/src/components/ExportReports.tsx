/**
 * Export Reports Component
 * Provides functionality to export bookings and statistics to PDF and Excel
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileText, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { Room, Asset, Booking } from '@/types';

interface ExportReportsProps {
  rooms?: Room[];
  assets?: Asset[];
  bookings?: Booking[];
  startDate: Date;
  endDate: Date;
}

export default function ExportReports({
  rooms = [],
  assets = [],
  bookings = [],
  startDate,
  endDate,
}: ExportReportsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = () => {
    setIsExporting(true);

    try {
      // Prepare CSV data
      const headers = ['ID', 'Тип ресурса', 'Ресурс', 'Название брони', 'Начало', 'Конец', 'Примечания'];
      const rows = bookings.map((booking) => {
        const resource = booking.resourceType === 'room'
          ? rooms.find((r) => r.id === booking.resourceId)
          : assets.find((a) => a.id === booking.resourceId);

        return [
          booking.id,
          booking.resourceType === 'room' ? 'Аудитория' : 'Инвентарь',
          resource?.name || 'Неизвестный ресурс',
          booking.title,
          format(new Date(booking.start), 'dd.MM.yyyy HH:mm'),
          format(new Date(booking.end), 'dd.MM.yyyy HH:mm'),
          booking.notes || '',
        ];
      });

      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...rows.map((row) =>
          row
            .map((cell) => {
              // Escape quotes and wrap in quotes if contains comma
              const str = String(cell);
              return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
            })
            .join(',')
        ),
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `bookings_${format(startDate, 'yyyy-MM-dd')}_${format(endDate, 'yyyy-MM-dd')}.csv`
      );
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToJSON = () => {
    setIsExporting(true);

    try {
      const data = {
        exportDate: new Date().toISOString(),
        period: {
          start: format(startDate, 'yyyy-MM-dd'),
          end: format(endDate, 'yyyy-MM-dd'),
        },
        summary: {
          totalRooms: rooms.length,
          totalAssets: assets.length,
          totalBookings: bookings.length,
        },
        rooms,
        assets,
        bookings,
      };

      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `report_${format(startDate, 'yyyy-MM-dd')}_${format(endDate, 'yyyy-MM-dd')}.json`
      );
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToHTML = () => {
    setIsExporting(true);

    try {
      const htmlContent = `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Отчет о бронированиях</title>
  <style>
    body { font-family: 'Manrope', Arial, sans-serif; margin: 20px; background: #f7f4fb; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 16px; }
    h1 { color: #2c2440; border-bottom: 2px solid #7c3aed; padding-bottom: 10px; font-family: 'Sora', Arial, sans-serif; }
    h2 { color: #6b6478; margin-top: 30px; font-family: 'Sora', Arial, sans-serif; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
    .stat-card { background: #f3edfc; padding: 15px; border-radius: 12px; border-left: 4px solid #7c3aed; }
    .stat-card .label { color: #6b6478; font-size: 12px; text-transform: uppercase; }
    .stat-card .value { font-size: 24px; font-weight: bold; color: #7c3aed; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #f3edfc; padding: 12px; text-align: left; border-bottom: 2px solid #7c3aed; font-weight: bold; }
    td { padding: 12px; border-bottom: 1px solid #e5e0ec; }
    tr:hover { background: #faf8fd; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e0ec; color: #9691a0; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 Отчет о бронированиях</h1>
    
    <div class="summary">
      <div class="stat-card">
        <div class="label">Период</div>
        <div class="value">${format(startDate, 'dd.MM.yyyy')} - ${format(endDate, 'dd.MM.yyyy')}</div>
      </div>
      <div class="stat-card">
        <div class="label">Аудиторий</div>
        <div class="value">${rooms.length}</div>
      </div>
      <div class="stat-card">
        <div class="label">Инвентаря</div>
        <div class="value">${assets.length}</div>
      </div>
      <div class="stat-card">
        <div class="label">Броней</div>
        <div class="value">${bookings.length}</div>
      </div>
    </div>

    <h2>Список броней</h2>
    <table>
      <thead>
        <tr>
          <th>Тип ресурса</th>
          <th>Ресурс</th>
          <th>Название</th>
          <th>Начало</th>
          <th>Конец</th>
          <th>Примечания</th>
        </tr>
      </thead>
      <tbody>
        ${bookings
          .map((booking) => {
            const resource = booking.resourceType === 'room'
              ? rooms.find((r) => r.id === booking.resourceId)
              : assets.find((a) => a.id === booking.resourceId);
            return `
          <tr>
            <td>${booking.resourceType === 'room' ? 'Аудитория' : 'Инвентарь'}</td>
            <td>${resource?.name || 'Неизвестный ресурс'}</td>
            <td>${booking.title}</td>
            <td>${format(new Date(booking.start), 'dd.MM.yyyy HH:mm')}</td>
            <td>${format(new Date(booking.end), 'dd.MM.yyyy HH:mm')}</td>
            <td>${booking.notes || '-'}</td>
          </tr>
            `;
          })
          .join('')}
      </tbody>
    </table>

    <div class="footer">
      <p>Отчет создан: ${format(new Date(), 'dd.MM.yyyy HH:mm:ss')}</p>
      <p>Harbor — система управления бронированием</p>
    </div>
  </div>
</body>
</html>
      `;

      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `report_${format(startDate, 'yyyy-MM-dd')}_${format(endDate, 'yyyy-MM-dd')}.html`
      );
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5" />
        <h3 className="font-semibold">Экспорт отчетов</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Период: {format(startDate, 'dd.MM.yyyy')} - {format(endDate, 'dd.MM.yyyy')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          onClick={exportToCSV}
          disabled={isExporting || bookings.length === 0}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Экспорт в CSV
        </Button>

        <Button
          onClick={exportToJSON}
          disabled={isExporting || bookings.length === 0}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Экспорт в JSON
        </Button>

        <Button
          onClick={exportToHTML}
          disabled={isExporting || bookings.length === 0}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Экспорт в HTML
        </Button>
      </div>

      {bookings.length === 0 && (
        <p className="text-xs text-muted-foreground mt-4">
          Нет данных для экспорта в выбранном периоде
        </p>
      )}
    </Card>
  );
}
