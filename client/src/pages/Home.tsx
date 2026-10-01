/**
 * Main application page with navigation between different views
 */

import React, { useState } from 'react';
import { Link } from 'wouter';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BookingForm } from '@/components/BookingForm';
import { ResourceCatalog } from '@/components/ResourceCatalog';
import { BookingTimeline } from '@/components/BookingTimeline';
import { DataImportExport } from '@/components/DataImportExport';
import { ApprovalsList } from '@/components/ApprovalsList';
import { NotificationBell } from '@/components/NotificationBell';
import AdvancedFilters, { type FilterState } from '@/components/AdvancedFilters';
import AvailabilityMatrix from '@/components/AvailabilityMatrix';
import TimelineView from '@/components/TimelineView';
import Statistics from '@/components/Statistics';
import ExportReports from '@/components/ExportReports';
import { Calendar, Package, Settings, Loader2, BarChart3, Grid3x3, ShieldCheck, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { t } from '@/lib/i18n';
import type { Booking } from '@/types';

export default function Home() {
  // All data and operations come from AppContext (IndexedDB — single source of truth)
  const {
    rooms,
    assets,
    bookings,
    loading,
    addBooking,
    updateBooking,
    deleteBooking,
    addBookingSeries,
    deleteBookingSeries,
  } = useApp();

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [selectedResourceType, setSelectedResourceType] = useState<'room' | 'asset' | null>(null);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [filterState, setFilterState] = useState<FilterState>({
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    resourceType: 'all',
    status: 'all',
  });
  const [selectedDate, setSelectedDate] = useState(new Date());

  const isLoading = loading;

  const handleBookingSubmit = async (booking: Booking) => {
    try {
      if (editingBooking) {
        await updateBooking(booking);
        setEditingBooking(null);
      } else {
        await addBooking(booking);
      }
      setShowBookingForm(false);
      setSelectedResourceType(null);
      setSelectedResourceId(null);
    } catch (error) {
      console.error('Failed to save booking:', error);
    }
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setShowBookingForm(true);
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (confirm('Вы уверены, что хотите удалить это бронирование?')) {
      try {
        await deleteBooking(bookingId);
      } catch (error) {
        console.error('Failed to delete booking:', error);
      }
    }
  };

  const handleSelectRoom = (roomId: string) => {
    setSelectedResourceType('room');
    setSelectedResourceId(roomId);
    setShowBookingForm(true);
  };

  const handleSelectAsset = (assetId: string) => {
    setSelectedResourceType('asset');
    setSelectedResourceId(assetId);
    setShowBookingForm(true);
  };

  const handleBookingSeriesSubmit = async (seriesBookings: Booking[]) => {
    try {
      await addBookingSeries(seriesBookings);
      setShowBookingForm(false);
      setSelectedResourceType(null);
      setSelectedResourceId(null);
    } catch (error) {
      console.error('Failed to save booking series:', error);
    }
  };

  const pendingApprovalsCount = bookings.filter((b) => b.status === 'pending').length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">{t('loadingApplication')}</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { value: 'catalog', icon: Package, label: t('catalog') },
    { value: 'timeline', icon: Calendar, label: t('timeline') },
    { value: 'bookings', icon: Settings, label: t('newBooking') },
    { value: 'approvals', icon: ShieldCheck, label: t('approvals'), count: pendingApprovalsCount },
    { value: 'data', icon: Settings, label: t('data') },
    { value: 'analytics', icon: BarChart3, label: 'Аналитика' },
    { value: 'advanced', icon: Grid3x3, label: 'Расширенно' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Tabs defaultValue="catalog" orientation="vertical" className="flex flex-col lg:flex-row items-stretch gap-0 w-full">
        {/* Sidebar */}
        <aside className="shrink-0 lg:w-72 border-b lg:border-b-0 lg:border-r border-border bg-card px-6 py-6 lg:py-10 lg:min-h-screen">
          <div className="mb-8 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary mb-2">
                Учёт бронирований
              </span>
              <h1 className="font-heading text-2xl font-bold text-foreground mb-2">{t('appTitle')}</h1>
              <p className="text-sm text-muted-foreground">{t('appSubtitle')}</p>
            </div>
            <NotificationBell />
          </div>

          <TabsList className="flex flex-row lg:flex-col h-auto w-full gap-1 bg-transparent p-0 overflow-x-auto lg:overflow-visible justify-start">
            {navItems.map(({ value, icon: Icon, label, count }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="w-full flex-none justify-start gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none hover:bg-muted"
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">{label}</span>
                {!!count && (
                  <Badge variant="destructive" className="ml-auto">
                    {count}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="hidden lg:block mt-8 pt-4 border-t border-border">
            <Link
              href="/admin"
              className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Wrench className="w-3.5 h-3.5" />
              Панель администратора
            </Link>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 p-6 lg:p-10">
          {/* Catalog Tab */}
          <TabsContent value="catalog">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-heading text-xl font-semibold mb-4">{t('resourceCatalog')}</h2>
              <ResourceCatalog
                onSelectRoom={handleSelectRoom}
                onSelectAsset={handleSelectAsset}
              />
            </div>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-heading text-xl font-semibold mb-4">{t('bookingTimeline')}</h2>
              <BookingTimeline
                onEditBooking={handleEditBooking}
                onDeleteBooking={handleDeleteBooking}
                onDeleteSeries={deleteBookingSeries}
              />
            </div>
          </TabsContent>

          {/* Approvals Tab */}
          <TabsContent value="approvals">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-heading text-xl font-semibold mb-4">{t('approvals')}</h2>
              <ApprovalsList />
            </div>
          </TabsContent>

          {/* New Booking Tab */}
          <TabsContent value="bookings">
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4 gap-4">
                <h2 className="font-heading text-xl font-semibold">{t('createNewBooking')}</h2>
                <Button
                  onClick={() => {
                    setEditingBooking(null);
                    setSelectedResourceType(null);
                    setSelectedResourceId(null);
                    setShowBookingForm(true);
                  }}
                >
                  {t('newBookingButton')}
                </Button>
              </div>
              {showBookingForm && (
                <BookingForm
                  booking={editingBooking || undefined}
                  onSubmit={handleBookingSubmit}
                  onSubmitSeries={handleBookingSeriesSubmit}
                  onCancel={() => {
                    setShowBookingForm(false);
                    setEditingBooking(null);
                  }}
                />
              )}
            </div>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-heading text-xl font-semibold mb-4">{t('importExport')}</h2>
              <div className="mb-6">
                <ExportReports
                  rooms={rooms}
                  assets={assets}
                  bookings={bookings}
                  startDate={filterState.startDate}
                  endDate={filterState.endDate}
                />
              </div>
              <DataImportExport />
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
              <div>
                <h2 className="font-heading text-xl font-semibold mb-4">Статистика и аналитика</h2>
                <Statistics
                  rooms={rooms}
                  assets={assets}
                  bookings={bookings}
                  startDate={filterState.startDate}
                  endDate={filterState.endDate}
                />
              </div>
            </div>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced">
            <div className="space-y-6">
              {/* Timeline View */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <TimelineView
                  rooms={rooms}
                  assets={assets}
                  bookings={bookings}
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  onBookingClick={handleEditBooking}
                />
              </div>

              {/* Matrix and Filters */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 lg:order-1">
                  <AvailabilityMatrix
                    rooms={rooms}
                    assets={assets}
                    bookings={bookings}
                    startDate={filterState.startDate}
                    endDate={filterState.endDate}
                  />
                </div>
                <div className="lg:col-span-1 lg:order-2">
                  <AdvancedFilters
                    onApply={setFilterState}
                    onDateRangeChange={(start, end) =>
                      setFilterState((prev) => ({ ...prev, startDate: start, endDate: end }))
                    }
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </main>
      </Tabs>

      {/* Booking Form Dialog */}
      <Dialog open={showBookingForm} onOpenChange={setShowBookingForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingBooking ? t('editBooking') : t('createNewBooking')}
            </DialogTitle>
            <DialogDescription>
              {editingBooking
                ? t('updateBookingDetails')
                : t('fillInDetails')}
            </DialogDescription>
          </DialogHeader>
          <BookingForm
            booking={editingBooking || undefined}
            onSubmit={handleBookingSubmit}
            onSubmitSeries={handleBookingSeriesSubmit}
            onCancel={() => {
              setShowBookingForm(false);
              setEditingBooking(null);
              setSelectedResourceType(null);
              setSelectedResourceId(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
