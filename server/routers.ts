import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { rooms, assets, bookings, type InsertRoom, type InsertAsset, type InsertBooking } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  rooms: router({
    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return { items: [] };
      const data = await db.select().from(rooms);
      return { items: data };
    }),

    create: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        capacity: z.number().int().positive(),
        features: z.array(z.string()).default([]),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const newRoom: InsertRoom = {
          id: nanoid(),
          name: input.name,
          capacity: input.capacity,
          features: input.features,
        };
        await db.insert(rooms).values(newRoom);
        return newRoom;
      }),

    update: publicProcedure
      .input(z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        capacity: z.number().int().positive().optional(),
        features: z.array(z.string()).optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const { id, ...updates } = input;
        await db.update(rooms).set(updates).where(eq(rooms.id, id));
        return { success: true };
      }),

    delete: publicProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.delete(rooms).where(eq(rooms.id, input.id));
        return { success: true };
      }),
  }),

  assets: router({
    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return { items: [] };
      const data = await db.select().from(assets);
      return { items: data };
    }),

    create: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        inventoryCode: z.string().min(1),
        status: z.enum(["available", "maintenance", "unavailable"]).default("available"),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const newAsset: InsertAsset = {
          id: nanoid(),
          name: input.name,
          inventoryCode: input.inventoryCode,
          status: input.status,
        };
        await db.insert(assets).values(newAsset);
        return newAsset;
      }),

    update: publicProcedure
      .input(z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        inventoryCode: z.string().min(1).optional(),
        status: z.enum(["available", "maintenance", "unavailable"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const { id, ...updates } = input;
        await db.update(assets).set(updates).where(eq(assets.id, id));
        return { success: true };
      }),

    delete: publicProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.delete(assets).where(eq(assets.id, input.id));
        return { success: true };
      }),
  }),

  bookings: router({
    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return { items: [] };
      const data = await db.select().from(bookings);
      return { items: data };
    }),

    create: publicProcedure
      .input(z.object({
        resourceType: z.enum(["room", "asset"]),
        resourceId: z.string().min(1),
        title: z.string().min(1),
        start: z.string(),
        end: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const newBooking: InsertBooking = {
          id: nanoid(),
          resourceType: input.resourceType,
          resourceId: input.resourceId,
          title: input.title,
          start: input.start,
          end: input.end,
          notes: input.notes,
        };
        await db.insert(bookings).values(newBooking);
        return newBooking;
      }),

    update: publicProcedure
      .input(z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        start: z.string().optional(),
        end: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const { id, ...updates } = input;
        await db.update(bookings).set(updates).where(eq(bookings.id, id));
        return { success: true };
      }),

    delete: publicProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.delete(bookings).where(eq(bookings.id, input.id));
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
