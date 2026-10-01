/**
 * Global application context for managing rooms, assets, and bookings
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Room, Asset, Booking, AppNotification } from '@/types';
import * as db from '@/lib/db';
import { toast } from 'sonner';
import { t } from '@/lib/i18n';

interface AppContextType {
  // Data
  rooms: Room[];
  assets: Asset[];
  bookings: Booking[];
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;

  // Room operations
  addRoom: (room: Room) => Promise<void>;
  updateRoom: (room: Room) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;

  // Asset operations
  addAsset: (asset: Asset) => Promise<void>;
  updateAsset: (asset: Asset) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;

  // Booking operations
  addBooking: (booking: Booking) => Promise<void>;
  updateBooking: (booking: Booking) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  updateBookingStatus: (id: string, status: NonNullable<Booking['status']>) => Promise<void>;
  addBookingSeries: (bookings: Booking[]) => Promise<void>;
  deleteBookingSeries: (seriesId: string) => Promise<void>;

  // Notifications
  markAllRead: () => Promise<void>;

  // Import/Export
  exportData: () => Promise<void>;
  importData: (data: any, policy: 'replace' | 'merge') => Promise<void>;

  // Refresh
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Initialize data from IndexedDB
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [roomsData, assetsData, bookingsData, notificationsData] = await Promise.all([
          db.getRooms(),
          db.getAssets(),
          db.getBookings(),
          db.getNotifications(),
        ]);
        setRooms(roomsData);
        setAssets(assetsData);
        setBookings(bookingsData);
        setNotifications(notificationsData);
      } catch (error) {
        console.error('Failed to initialize app data:', error);
        toast.error(t('failedToLoadData'));
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const refreshData = useCallback(async () => {
    try {
      const [roomsData, assetsData, bookingsData, notificationsData] = await Promise.all([
        db.getRooms(),
        db.getAssets(),
        db.getBookings(),
        db.getNotifications(),
      ]);
      setRooms(roomsData);
      setAssets(assetsData);
      setBookings(bookingsData);
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Failed to refresh data:', error);
      toast.error(t('failedToRefreshData'));
    }
  }, []);

  const pushNotification = useCallback(
    async (type: AppNotification['type'], message: string, relatedBookingId?: string) => {
      const notification: AppNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type,
        message,
        relatedBookingId,
        createdAt: new Date().toISOString(),
        read: false,
      };
      try {
        await db.saveNotification(notification);
        setNotifications((prev) => [notification, ...prev]);
      } catch (error) {
        console.error('Failed to save notification:', error);
      }
    },
    []
  );

  const markAllRead = useCallback(async () => {
    try {
      await db.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  }, []);

  const addRoom = useCallback(async (room: Room) => {
    try {
      await db.saveRoom(room);
      setRooms((prev) => [...prev, room]);
      toast.success(t('roomAddedSuccess'));
    } catch (error) {
      console.error('Failed to add room:', error);
      toast.error(t('failedToAddRoom'));
    }
  }, []);

  const updateRoom = useCallback(async (room: Room) => {
    try {
      await db.saveRoom(room);
      setRooms((prev) => prev.map((r) => (r.id === room.id ? room : r)));
      toast.success(t('roomUpdatedSuccess'));
    } catch (error) {
      console.error('Failed to update room:', error);
      toast.error(t('failedToUpdateRoom'));
    }
  }, []);

  const deleteRoom = useCallback(async (id: string) => {
    try {
      await db.deleteRoom(id);
      setRooms((prev) => prev.filter((r) => r.id !== id));
      toast.success(t('roomDeletedSuccess'));
    } catch (error) {
      console.error('Failed to delete room:', error);
      toast.error(t('failedToDeleteRoom'));
    }
  }, []);

  const addAsset = useCallback(async (asset: Asset) => {
    try {
      await db.saveAsset(asset);
      setAssets((prev) => [...prev, asset]);
      toast.success(t('assetAddedSuccess'));
    } catch (error) {
      console.error('Failed to add asset:', error);
      toast.error(t('failedToAddAsset'));
    }
  }, []);

  const updateAsset = useCallback(async (asset: Asset) => {
    try {
      await db.saveAsset(asset);
      setAssets((prev) => prev.map((a) => (a.id === asset.id ? asset : a)));
      toast.success(t('assetUpdatedSuccess'));
    } catch (error) {
      console.error('Failed to update asset:', error);
      toast.error(t('failedToUpdateAsset'));
    }
  }, []);

  const deleteAsset = useCallback(async (id: string) => {
    try {
      await db.deleteAsset(id);
      setAssets((prev) => prev.filter((a) => a.id !== id));
      toast.success(t('assetDeletedSuccess'));
    } catch (error) {
      console.error('Failed to delete asset:', error);
      toast.error(t('failedToDeleteAsset'));
    }
  }, []);

  const addBooking = useCallback(async (booking: Booking) => {
    try {
      const resource =
        booking.resourceType === 'room'
          ? rooms.find((r) => r.id === booking.resourceId)
          : assets.find((a) => a.id === booking.resourceId);
      const bookingToSave: Booking = {
        ...booking,
        status: resource?.requiresApproval ? 'pending' : booking.status || 'confirmed',
      };

      await db.saveBooking(bookingToSave);
      setBookings((prev) => [...prev, bookingToSave]);
      toast.success(t('bookingCreatedSuccess'));

      if (bookingToSave.status === 'pending') {
        pushNotification(
          'booking_pending',
          `Бронирование "${bookingToSave.title}" ожидает подтверждения`,
          bookingToSave.id
        );
      }
    } catch (error) {
      console.error('Failed to add booking:', error);
      toast.error(t('failedToCreateBooking'));
    }
  }, [rooms, assets, pushNotification]);

  const updateBooking = useCallback(async (booking: Booking) => {
    try {
      await db.saveBooking(booking);
      setBookings((prev) => prev.map((b) => (b.id === booking.id ? booking : b)));
      toast.success(t('bookingUpdatedSuccess'));
    } catch (error) {
      console.error('Failed to update booking:', error);
      toast.error(t('failedToUpdateBooking'));
    }
  }, []);

  const deleteBooking = useCallback(async (id: string) => {
    try {
      await db.deleteBooking(id);
      setBookings((prev) => prev.filter((b) => b.id !== id));
      toast.success(t('bookingDeletedSuccess'));
    } catch (error) {
      console.error('Failed to delete booking:', error);
      toast.error(t('failedToDeleteBooking'));
    }
  }, []);

  const updateBookingStatus = useCallback(
    async (id: string, status: NonNullable<Booking['status']>) => {
      try {
        const existing = bookings.find((b) => b.id === id);
        if (!existing) return;

        const updated: Booking = { ...existing, status, updatedAt: new Date() };
        await db.saveBooking(updated);
        setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));

        if (status === 'confirmed') {
          toast.success(t('bookingApprovedSuccess'));
          pushNotification('booking_approved', `Бронирование "${updated.title}" подтверждено`, id);
        } else if (status === 'cancelled') {
          toast.success(t('bookingRejectedSuccess'));
          pushNotification('booking_rejected', `Бронирование "${updated.title}" отклонено`, id);
        }
      } catch (error) {
        console.error('Failed to update booking status:', error);
        toast.error(t('failedToUpdateBookingStatus'));
      }
    },
    [bookings, pushNotification]
  );

  const addBookingSeries = useCallback(
    async (seriesBookings: Booking[]) => {
      try {
        await Promise.all(seriesBookings.map((b) => db.saveBooking(b)));
        setBookings((prev) => [...prev, ...seriesBookings]);
        toast.success(t('seriesCreatedSuccess'));

        const pendingCount = seriesBookings.filter((b) => b.status === 'pending').length;
        if (pendingCount > 0) {
          const title = seriesBookings[0]?.title || '';
          pushNotification(
            'booking_pending',
            `Серия бронирований "${title}" (${pendingCount}) ожидает подтверждения`
          );
        }
      } catch (error) {
        console.error('Failed to add booking series:', error);
        toast.error(t('failedToCreateSeries'));
      }
    },
    [pushNotification]
  );

  const deleteBookingSeries = useCallback(async (seriesId: string) => {
    try {
      const toDelete = bookings.filter((b) => b.seriesId === seriesId);
      await Promise.all(toDelete.map((b) => db.deleteBooking(b.id)));
      setBookings((prev) => prev.filter((b) => b.seriesId !== seriesId));
      toast.success(t('seriesDeletedSuccess'));
    } catch (error) {
      console.error('Failed to delete booking series:', error);
      toast.error(t('failedToDeleteSeries'));
    }
  }, [bookings]);

  const exportData = useCallback(async () => {
    try {
      const data = await db.exportData();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `harbor-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(t('dataExportedSuccess'));
    } catch (error) {
      console.error('Failed to export data:', error);
      toast.error(t('failedToExportData'));
    }
  }, []);

  const importData = useCallback(
    async (data: any, policy: 'replace' | 'merge') => {
      try {
        if (policy === 'replace') {
          await db.importDataReplace(data);
        } else {
          await db.importDataMerge(data);
        }
        await refreshData();
        toast.success(t('dataImportedSuccess'));
      } catch (error) {
        console.error('Failed to import data:', error);
        toast.error(t('failedToImportData'));
      }
    },
    [refreshData]
  );

  const value: AppContextType = {
    rooms,
    assets,
    bookings,
    notifications,
    unreadCount,
    loading,
    addRoom,
    updateRoom,
    deleteRoom,
    addAsset,
    updateAsset,
    deleteAsset,
    addBooking,
    updateBooking,
    deleteBooking,
    updateBookingStatus,
    addBookingSeries,
    deleteBookingSeries,
    markAllRead,
    exportData,
    importData,
    refreshData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
