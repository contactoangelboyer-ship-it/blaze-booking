import { pgTable, serial, text, integer, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const serviceTypeEnum = pgEnum("service_type", [
  "airport_transfer",
  "point_to_point",
  "hourly",
  "corporate",
  "special_event",
]);

export const vehicleTypeEnum = pgEnum("vehicle_type", ["sedan", "suv"]);

export const reservationStatusEnum = pgEnum("reservation_status", [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
]);

export const reservationsTable = pgTable("reservations", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  pickupAddress: text("pickup_address").notNull(),
  dropoffAddress: text("dropoff_address").notNull(),
  pickupDate: text("pickup_date").notNull(),
  pickupTime: text("pickup_time").notNull(),
  serviceType: serviceTypeEnum("service_type").notNull(),
  vehicleType: vehicleTypeEnum("vehicle_type").notNull(),
  passengers: integer("passengers").notNull().default(1),
  luggage: integer("luggage").notNull().default(0),
  hours: integer("hours"),
  flightNumber: text("flight_number"),
  specialRequests: text("special_requests"),
  estimatedFare: numeric("estimated_fare", { precision: 10, scale: 2 }).notNull().default("0"),
  status: reservationStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReservationSchema = createInsertSchema(reservationsTable).omit({ id: true, createdAt: true, status: true });
export const selectReservationSchema = createSelectSchema(reservationsTable);

export type InsertReservation = z.infer<typeof insertReservationSchema>;
export type Reservation = typeof reservationsTable.$inferSelect;
