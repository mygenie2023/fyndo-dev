import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, decimal, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";


export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phoneNumber: text("phone_number").notNull().unique(),
  name: text("name").notNull(),
  userType: text("user_type").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 6 }),
  longitude: decimal("longitude", { precision: 10, scale: 6 }),
  location: text("location"),
  skills: jsonb("skills").$type<string[]>().default([]),
  skillLevel: text("skill_level"),
  hourlyRate: integer("hourly_rate"),
  gender: text("gender"),
  dateOfBirth: text("date_of_birth"),
  expectedDailySalary: integer("expected_daily_salary"),
  travelDistance: integer("travel_distance"),
  comfortableStaying: text("comfortable_staying"),
  aadharFrontUrl: text("aadhar_front_url"),
  aadharBackUrl: text("aadhar_back_url"),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0"),
  totalRatings: integer("total_ratings").default(0),
  jobsCompleted: integer("jobs_completed").default(0),
  totalEarnings: integer("total_earnings").default(0),
  pendingPayments: integer("pending_payments").default(0),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  locationIdx: index("location_idx").on(table.latitude, table.longitude),
}));

export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  farmerId: varchar("farmer_id").notNull().references(() => users.id),
  serviceType: text("service_type").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  duration: integer("duration").notNull(),
  associatesNeeded: integer("associates_needed").notNull(),
  skillLevel: text("skill_level").notNull(),
  budget: integer("budget").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 6 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 6 }).notNull(),
  location: text("location").notNull(),
  status: text("status").notNull().default("Open"),
  paymentMethod: text("payment_method"),
  jobComment: text("job_comment"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  farmerIdx: index("farmer_idx").on(table.farmerId),
  statusIdx: index("status_idx").on(table.status),
  locationIdx: index("job_location_idx").on(table.latitude, table.longitude),
}));

export const jobInterests = pgTable("job_interests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull().references(() => jobs.id),
  associateId: varchar("associate_id").notNull().references(() => users.id),
  status: text("status").notNull().default("interested"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  jobIdx: index("job_interest_job_idx").on(table.jobId),
  associateIdx: index("job_interest_associate_idx").on(table.associateId),
}));

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull().references(() => jobs.id),
  farmerId: varchar("farmer_id").notNull().references(() => users.id),
  associateId: varchar("associate_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  reviewText: text("review_text"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  associateIdx: index("review_associate_idx").on(table.associateId),
  jobIdx: index("review_job_idx").on(table.jobId),
}));

export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  iconName: text("icon_name").notNull(),
  isActive: integer("is_active").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).extend({
  skills: z.array(z.string()).optional(),
}).omit({
  id: true,
  createdAt: true,
  averageRating: true,
  totalRatings: true,
  jobsCompleted: true,
  totalEarnings: true,
  pendingPayments: true,
});



export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertJobInterestSchema = createInsertSchema(jobInterests).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertJobInterest = z.infer<typeof insertJobInterestSchema>;
export type JobInterest = typeof jobInterests.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;

// Admin types
export const adminLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type AdminLogin = z.infer<typeof adminLoginSchema>;

export interface AdminSession {
  id: string;
  username: string;
  isAdmin: true;
}
