/**
 * IndexedDB utilities for Harbor
 * Provides async storage with indexing and transactions
 */

import type { AppData, AppNotification, Booking, Room, Asset } from '@/types';

const DB_NAME = 'Harbor';
const DB_VERSION = 2;
const ROOMS_STORE = 'rooms';
const ASSETS_STORE = 'assets';
const BOOKINGS_STORE = 'bookings';
const NOTIFICATIONS_STORE = 'notifications';

let dbInstance: IDBDatabase | null = null;

/**
 * Initialize IndexedDB connection
 */
export async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const upgradeTransaction = (event.target as IDBOpenDBRequest).transaction!;

      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(ROOMS_STORE)) {
        db.createObjectStore(ROOMS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(ASSETS_STORE)) {
        db.createObjectStore(ASSETS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(BOOKINGS_STORE)) {
        const bookingStore = db.createObjectStore(BOOKINGS_STORE, { keyPath: 'id' });
        // Create indexes for efficient querying
        bookingStore.createIndex('resourceId', 'resourceId', { unique: false });
        bookingStore.createIndex('start', 'start', { unique: false });
        bookingStore.createIndex('end', 'end', { unique: false });
        bookingStore.createIndex('seriesId', 'seriesId', { unique: false });
      } else {
        // Upgrading an existing (v1) database: add the seriesId index for recurring bookings
        const bookingStore = upgradeTransaction.objectStore(BOOKINGS_STORE);
        if (!bookingStore.indexNames.contains('seriesId')) {
          bookingStore.createIndex('seriesId', 'seriesId', { unique: false });
        }
      }
      if (!db.objectStoreNames.contains(NOTIFICATIONS_STORE)) {
        const notificationStore = db.createObjectStore(NOTIFICATIONS_STORE, { keyPath: 'id' });
        notificationStore.createIndex('read', 'read', { unique: false });
        notificationStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
}

/**
 * Get all rooms
 */
export async function getRooms(): Promise<Room[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([ROOMS_STORE], 'readonly');
    const store = transaction.objectStore(ROOMS_STORE);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Get room by ID
 */
export async function getRoom(id: string): Promise<Room | undefined> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([ROOMS_STORE], 'readonly');
    const store = transaction.objectStore(ROOMS_STORE);
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Add or update room
 */
export async function saveRoom(room: Room): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([ROOMS_STORE], 'readwrite');
    const store = transaction.objectStore(ROOMS_STORE);
    const request = store.put(room);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Delete room
 */
export async function deleteRoom(id: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([ROOMS_STORE], 'readwrite');
    const store = transaction.objectStore(ROOMS_STORE);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Get all assets
 */
export async function getAssets(): Promise<Asset[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([ASSETS_STORE], 'readonly');
    const store = transaction.objectStore(ASSETS_STORE);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Get asset by ID
 */
export async function getAsset(id: string): Promise<Asset | undefined> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([ASSETS_STORE], 'readonly');
    const store = transaction.objectStore(ASSETS_STORE);
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Add or update asset
 */
export async function saveAsset(asset: Asset): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([ASSETS_STORE], 'readwrite');
    const store = transaction.objectStore(ASSETS_STORE);
    const request = store.put(asset);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Delete asset
 */
export async function deleteAsset(id: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([ASSETS_STORE], 'readwrite');
    const store = transaction.objectStore(ASSETS_STORE);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Get all bookings
 */
export async function getBookings(): Promise<Booking[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([BOOKINGS_STORE], 'readonly');
    const store = transaction.objectStore(BOOKINGS_STORE);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Get booking by ID
 */
export async function getBooking(id: string): Promise<Booking | undefined> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([BOOKINGS_STORE], 'readonly');
    const store = transaction.objectStore(BOOKINGS_STORE);
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Get bookings for a specific resource
 */
export async function getBookingsByResourceId(resourceId: string): Promise<Booking[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([BOOKINGS_STORE], 'readonly');
    const store = transaction.objectStore(BOOKINGS_STORE);
    const index = store.index('resourceId');
    const request = index.getAll(resourceId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Add or update booking
 */
export async function saveBooking(booking: Booking): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([BOOKINGS_STORE], 'readwrite');
    const store = transaction.objectStore(BOOKINGS_STORE);
    const request = store.put(booking);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Delete booking
 */
export async function deleteBooking(id: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([BOOKINGS_STORE], 'readwrite');
    const store = transaction.objectStore(BOOKINGS_STORE);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Clear all data (used for import with Replace All policy)
 */
export async function clearAllData(): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      [ROOMS_STORE, ASSETS_STORE, BOOKINGS_STORE],
      'readwrite'
    );

    const roomsReq = transaction.objectStore(ROOMS_STORE).clear();
    const assetsReq = transaction.objectStore(ASSETS_STORE).clear();
    const bookingsReq = transaction.objectStore(BOOKINGS_STORE).clear();

    transaction.onerror = () => reject(transaction.error);
    transaction.oncomplete = () => resolve();
  });
}

/**
 * Export all data
 */
export async function exportData(): Promise<AppData> {
  const rooms = await getRooms();
  const assets = await getAssets();
  const bookings = await getBookings();

  return {
    rooms,
    assets,
    bookings,
    exportedAt: new Date().toISOString(),
    schemaVersion: '1.0.0',
  };
}

/**
 * Import data with Replace All policy
 */
export async function importDataReplace(data: AppData): Promise<void> {
  await clearAllData();
  
  const db = await initDB();
  const transaction = db.transaction(
    [ROOMS_STORE, ASSETS_STORE, BOOKINGS_STORE],
    'readwrite'
  );

  // Insert rooms
  const roomsStore = transaction.objectStore(ROOMS_STORE);
  for (const room of data.rooms) {
    roomsStore.put(room);
  }

  // Insert assets
  const assetsStore = transaction.objectStore(ASSETS_STORE);
  for (const asset of data.assets) {
    assetsStore.put(asset);
  }

  // Insert bookings
  const bookingsStore = transaction.objectStore(BOOKINGS_STORE);
  for (const booking of data.bookings) {
    bookingsStore.put(booking);
  }

  return new Promise((resolve, reject) => {
    transaction.onerror = () => reject(transaction.error);
    transaction.oncomplete = () => resolve();
  });
}

/**
 * Import data with Merge policy
 */
export async function importDataMerge(data: AppData): Promise<void> {
  const db = await initDB();
  const transaction = db.transaction(
    [ROOMS_STORE, ASSETS_STORE, BOOKINGS_STORE],
    'readwrite'
  );

  // Merge rooms
  const roomsStore = transaction.objectStore(ROOMS_STORE);
  for (const room of data.rooms) {
    roomsStore.put(room);
  }

  // Merge assets
  const assetsStore = transaction.objectStore(ASSETS_STORE);
  for (const asset of data.assets) {
    assetsStore.put(asset);
  }

  // Merge bookings
  const bookingsStore = transaction.objectStore(BOOKINGS_STORE);
  for (const booking of data.bookings) {
    bookingsStore.put(booking);
  }

  return new Promise((resolve, reject) => {
    transaction.onerror = () => reject(transaction.error);
    transaction.oncomplete = () => resolve();
  });
}

/**
 * Get all notifications
 */
export async function getNotifications(): Promise<AppNotification[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([NOTIFICATIONS_STORE], 'readonly');
    const store = transaction.objectStore(NOTIFICATIONS_STORE);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Add or update a notification
 */
export async function saveNotification(notification: AppNotification): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([NOTIFICATIONS_STORE], 'readwrite');
    const store = transaction.objectStore(NOTIFICATIONS_STORE);
    const request = store.put(notification);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Mark a single notification as read
 */
export async function markNotificationRead(id: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([NOTIFICATIONS_STORE], 'readwrite');
    const store = transaction.objectStore(NOTIFICATIONS_STORE);
    const getRequest = store.get(id);

    getRequest.onerror = () => reject(getRequest.error);
    getRequest.onsuccess = () => {
      const notification = getRequest.result as AppNotification | undefined;
      if (!notification) {
        resolve();
        return;
      }
      const putRequest = store.put({ ...notification, read: true });
      putRequest.onerror = () => reject(putRequest.error);
      putRequest.onsuccess = () => resolve();
    };
  });
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead(): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([NOTIFICATIONS_STORE], 'readwrite');
    const store = transaction.objectStore(NOTIFICATIONS_STORE);
    const getAllRequest = store.getAll();

    getAllRequest.onerror = () => reject(getAllRequest.error);
    getAllRequest.onsuccess = () => {
      const notifications = getAllRequest.result as AppNotification[];
      for (const notification of notifications) {
        if (!notification.read) {
          store.put({ ...notification, read: true });
        }
      }
    };

    transaction.onerror = () => reject(transaction.error);
    transaction.oncomplete = () => resolve();
  });
}
