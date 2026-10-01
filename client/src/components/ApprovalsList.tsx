/**
 * Lists bookings awaiting approval for resources flagged as requiresApproval
 */

import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatUTCForDisplay } from '@/lib/timeUtils';
import { t } from '@/lib/i18n';
import type { Booking } from '@/types';

export function ApprovalsList() {
  const { bookings, rooms, assets, updateBookingStatus } = useApp();

  const pendingBookings = bookings
    .filter((b) => b.status === 'pending')
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  const getResourceName = (booking: Booking): string => {
    if (booking.resourceType === 'room') {
      return rooms.find((r) => r.id === booking.resourceId)?.name || `${t('room')} ${booking.resourceId}`;
    }
    return assets.find((a) => a.id === booking.resourceId)?.name || `${t('asset')} ${booking.resourceId}`;
  };

  if (pendingBookings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>{t('noApprovalsNeeded')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pendingBookings.map((booking) => (
        <Card key={booking.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <CardTitle className="text-lg mb-1">{booking.title}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                  <Badge variant="secondary">{getResourceName(booking)}</Badge>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    <Clock className="w-3 h-3" />
                    {t('pendingApproval')}
                  </Badge>
                  <span>
                    {formatUTCForDisplay(booking.start)} - {new Date(booking.end).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  size="sm"
                  onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {t('approve')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                  className="text-destructive hover:text-destructive"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  {t('reject')}
                </Button>
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
  );
}
