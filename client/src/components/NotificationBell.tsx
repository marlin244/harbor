/**
 * Bell icon with unread-count badge, showing persisted notifications
 * plus on-demand "starting soon" reminders computed when the panel opens
 */

import React, { useMemo, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bell, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { formatUTCForDisplay, formatUTCForTimeInput } from '@/lib/timeUtils';
import { t } from '@/lib/i18n';
import type { AppNotification } from '@/types';

const ICONS: Record<AppNotification['type'], React.ComponentType<{ className?: string }>> = {
  booking_pending: Clock,
  booking_approved: CheckCircle,
  booking_rejected: XCircle,
  booking_upcoming: AlertCircle,
};

const ICON_COLORS: Record<AppNotification['type'], string> = {
  booking_pending: 'text-amber-600',
  booking_approved: 'text-emerald-600',
  booking_rejected: 'text-rose-600',
  booking_upcoming: 'text-primary',
};

export function NotificationBell() {
  const { bookings, notifications, unreadCount, markAllRead } = useApp();
  const [open, setOpen] = useState(false);

  const upcomingSoon: AppNotification[] = useMemo(() => {
    if (!open) return [];
    const now = Date.now();
    const in30Min = now + 30 * 60 * 1000;

    return bookings
      .filter((b) => {
        const start = new Date(b.start).getTime();
        return b.status !== 'cancelled' && start >= now && start <= in30Min;
      })
      .map((b) => ({
        id: `upcoming-${b.id}`,
        type: 'booking_upcoming' as const,
        message: `Бронирование "${b.title}" начнётся в ${formatUTCForTimeInput(b.start)}`,
        relatedBookingId: b.id,
        createdAt: b.start,
        read: true,
      }));
  }, [open, bookings]);

  const items = [...upcomingSoon, ...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen && unreadCount > 0) {
      markAllRead();
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative shrink-0">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full text-[10px] justify-center"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="px-4 py-3 border-b border-border font-heading font-semibold text-sm">
          {t('notifications')}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">{t('noNotifications')}</p>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((notification) => {
                const Icon = ICONS[notification.type];
                return (
                  <li key={notification.id} className="flex items-start gap-3 px-4 py-3">
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${ICON_COLORS[notification.type]}`} />
                    <div className="min-w-0">
                      <p className="text-sm text-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatUTCForDisplay(notification.createdAt)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
