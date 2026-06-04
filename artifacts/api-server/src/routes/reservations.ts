import { Router, type IRouter } from "express";
import { eq, desc, count, sql } from "drizzle-orm";
import { db, reservationsTable } from "@workspace/db";
import {
  CreateReservationBody,
  UpdateReservationStatusBody,
  GetReservationParams,
  UpdateReservationStatusParams,
  ListReservationsQueryParams,
} from "@workspace/api-zod";
import { sendClientConfirmationEmail, sendOperatorNotificationEmail } from "../lib/email";

const router: IRouter = Router();

router.get("/reservations", async (req, res): Promise<void> => {
  const params = ListReservationsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  let query = db.select().from(reservationsTable).$dynamic();

  if (params.data.status) {
    query = query.where(eq(reservationsTable.status, params.data.status as "pending" | "confirmed" | "cancelled" | "completed"));
  }

  if (params.data.date) {
    query = query.where(eq(reservationsTable.pickupDate, params.data.date));
  }

  const reservations = await query.orderBy(desc(reservationsTable.createdAt));
  res.json(reservations.map(r => ({
    ...r,
    estimatedFare: Number(r.estimatedFare),
    createdAt: r.createdAt.toISOString(),
  })));
});

router.post("/reservations", async (req, res): Promise<void> => {
  const parsed = CreateReservationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;
  const [reservation] = await db.insert(reservationsTable).values({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    pickupAddress: data.pickupAddress,
    dropoffAddress: data.dropoffAddress,
    pickupDate: data.pickupDate,
    pickupTime: data.pickupTime,
    serviceType: data.serviceType as "airport_transfer" | "point_to_point" | "hourly" | "corporate" | "special_event",
    vehicleType: data.vehicleType as "sedan" | "suv",
    passengers: data.passengers,
    luggage: data.luggage ?? 0,
    hours: data.hours ?? null,
    flightNumber: data.flightNumber ?? null,
    specialRequests: data.specialRequests ?? null,
    estimatedFare: String(data.estimatedFare ?? 0),
    status: "pending",
  }).returning();

  // Send emails asynchronously — don't block the response but log any failures
  Promise.all([
    sendClientConfirmationEmail(reservation),
    sendOperatorNotificationEmail(reservation),
  ]).catch((err) => {
    req.log.error({ err, reservationId: reservation.id }, "⚠️ One or more emails failed after reservation saved");
  });

  res.status(201).json({
    ...reservation,
    estimatedFare: Number(reservation.estimatedFare),
    createdAt: reservation.createdAt.toISOString(),
  });
});

router.get("/reservations/stats", async (_req, res): Promise<void> => {
  const [totals] = await db.select({
    total: count(),
    pending: sql<number>`sum(case when status = 'pending' then 1 else 0 end)`,
    confirmed: sql<number>`sum(case when status = 'confirmed' then 1 else 0 end)`,
    completed: sql<number>`sum(case when status = 'completed' then 1 else 0 end)`,
    cancelled: sql<number>`sum(case when status = 'cancelled' then 1 else 0 end)`,
    totalRevenue: sql<number>`coalesce(sum(case when status in ('confirmed','completed') then estimated_fare else 0 end), 0)`,
    sedanBookings: sql<number>`sum(case when vehicle_type = 'sedan' then 1 else 0 end)`,
    suvBookings: sql<number>`sum(case when vehicle_type = 'suv' then 1 else 0 end)`,
    airportTransfers: sql<number>`sum(case when service_type = 'airport_transfer' then 1 else 0 end)`,
    hourlyBookings: sql<number>`sum(case when service_type = 'hourly' then 1 else 0 end)`,
    corporateBookings: sql<number>`sum(case when service_type = 'corporate' then 1 else 0 end)`,
    specialEvents: sql<number>`sum(case when service_type = 'special_event' then 1 else 0 end)`,
    pointToPoint: sql<number>`sum(case when service_type = 'point_to_point' then 1 else 0 end)`,
  }).from(reservationsTable);

  res.json({
    total: Number(totals.total) || 0,
    pending: Number(totals.pending) || 0,
    confirmed: Number(totals.confirmed) || 0,
    completed: Number(totals.completed) || 0,
    cancelled: Number(totals.cancelled) || 0,
    totalRevenue: Number(totals.totalRevenue) || 0,
    sedanBookings: Number(totals.sedanBookings) || 0,
    suvBookings: Number(totals.suvBookings) || 0,
    airportTransfers: Number(totals.airportTransfers) || 0,
    hourlyBookings: Number(totals.hourlyBookings) || 0,
    corporateBookings: Number(totals.corporateBookings) || 0,
    specialEvents: Number(totals.specialEvents) || 0,
    pointToPoint: Number(totals.pointToPoint) || 0,
  });
});

router.get("/reservations/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetReservationParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [reservation] = await db.select().from(reservationsTable).where(eq(reservationsTable.id, params.data.id));
  if (!reservation) {
    res.status(404).json({ error: "Reservation not found" });
    return;
  }

  res.json({
    ...reservation,
    estimatedFare: Number(reservation.estimatedFare),
    createdAt: reservation.createdAt.toISOString(),
  });
});

router.patch("/reservations/:id/status", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateReservationStatusParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const parsed = UpdateReservationStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [reservation] = await db
    .update(reservationsTable)
    .set({ status: parsed.data.status as "pending" | "confirmed" | "cancelled" | "completed" })
    .where(eq(reservationsTable.id, params.data.id))
    .returning();

  if (!reservation) {
    res.status(404).json({ error: "Reservation not found" });
    return;
  }

  res.json({
    ...reservation,
    estimatedFare: Number(reservation.estimatedFare),
    createdAt: reservation.createdAt.toISOString(),
  });
});

export default router;
