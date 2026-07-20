import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const trips = sqliteTable("trips", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  passenger: text("passenger").notNull(),
  surname: text("surname").notNull().default(""),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  departureDate: text("departure_date").notNull(),
  departureTime: text("departure_time").notNull().default(""),
  airline: text("airline").notNull(),
  locator: text("locator").notNull(),
  status: text("status").notNull().default("Confirmada"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
