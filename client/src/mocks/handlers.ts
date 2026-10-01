/**
 * MSW Request Handlers
 * Mock Service Worker handlers for API endpoints
 */

import { http as httpHandler } from 'msw';
import type { Room, Asset, Booking } from '@/types';

// Mock data
const mockRooms: Room[] = [
  {
    id: 'room-1',
    name: 'Конференц-зал А',
    capacity: 50,
    features: ['Проектор', 'Белая доска', 'Видеоконференция'],
  },
  {
    id: 'room-2',
    name: 'Переговорная 1',
    capacity: 8,
    features: ['Круглый стол', 'Телефон'],
  },
  {
    id: 'room-3',
    name: 'Аудитория 101',
    capacity: 120,
    features: ['Проектор', 'Экран', 'Микрофон', 'Видеоконференция'],
  },
];

const mockAssets: Asset[] = [
  {
    id: 'asset-1',
    name: 'Проектор',
    inventoryCode: 'PROJ-001',
    status: 'available',
  },
  {
    id: 'asset-2',
    name: 'Ноутбук',
    inventoryCode: 'LAPTOP-001',
    status: 'available',
  },
  {
    id: 'asset-3',
    name: 'Микрофон',
    inventoryCode: 'MIC-001',
    status: 'maintenance',
  },
];

const mockBookings: Booking[] = [
  {
    id: 'booking-1',
    resourceType: 'room',
    resourceId: 'room-1',
    title: 'Планерка команды',
    start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    end: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    notes: 'Еженедельная встреча',
  },
];

export const handlers = [
  // Get all rooms
  httpHandler.get('/api/rooms', () => {
    return new Response(
      JSON.stringify({
        items: mockRooms,
        total: mockRooms.length,
        page: 1,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }),

  // Get room by ID
  httpHandler.get('/api/rooms/:id', ({ params }) => {
    const room = mockRooms.find((r) => r.id === params.id);
    if (!room) {
      return new Response(
        JSON.stringify({ error: 'Room not found', code: 'NOT_FOUND' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new Response(JSON.stringify({ data: room }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }),

  // Get all assets
  httpHandler.get('/api/assets', () => {
    return new Response(
      JSON.stringify({
        items: mockAssets,
        total: mockAssets.length,
        page: 1,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }),

  // Get asset by ID
  httpHandler.get('/api/assets/:id', ({ params }) => {
    const asset = mockAssets.find((a) => a.id === params.id);
    if (!asset) {
      return new Response(
        JSON.stringify({ error: 'Asset not found', code: 'NOT_FOUND' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new Response(JSON.stringify({ data: asset }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }),

  // Get all bookings
  httpHandler.get('/api/bookings', () => {
    return new Response(
      JSON.stringify({
        items: mockBookings,
        total: mockBookings.length,
        page: 1,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }),

  // Get bookings by date range
  httpHandler.get('/api/bookings/range', ({ request }) => {
    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    // Filter bookings by date range
    const filtered = mockBookings.filter((b) => {
      const bookingStart = new Date(b.start);
      const bookingEnd = new Date(b.end);
      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date();

      return bookingStart >= start && bookingEnd <= end;
    });

    return new Response(
      JSON.stringify({
        items: filtered,
        total: filtered.length,
        page: 1,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }),

  // Create booking
  httpHandler.post('/api/bookings', async ({ request }) => {
    const booking = (await request.json()) as Booking;
    const newBooking = { ...booking, id: `booking-${Date.now()}` };
    mockBookings.push(newBooking);

    return new Response(JSON.stringify({ data: newBooking }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  }),

  // Update booking
  httpHandler.put('/api/bookings/:id', async ({ params, request }) => {
    const updatedData = (await request.json()) as Partial<Booking>;
    const index = mockBookings.findIndex((b) => b.id === params.id);

    if (index === -1) {
      return new Response(
        JSON.stringify({ error: 'Booking not found', code: 'NOT_FOUND' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    mockBookings[index] = { ...mockBookings[index], ...updatedData };

    return new Response(JSON.stringify({ data: mockBookings[index] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }),

  // Delete booking
  httpHandler.delete('/api/bookings/:id', ({ params }) => {
    const index = mockBookings.findIndex((b) => b.id === params.id);

    if (index === -1) {
      return new Response(
        JSON.stringify({ error: 'Booking not found', code: 'NOT_FOUND' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    mockBookings.splice(index, 1);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }),
];
