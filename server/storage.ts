import { db } from "./db";
import { sql } from "drizzle-orm";
import {
  users,
  jobs,
  jobInterests,
  reviews,
  services,
  type User,
  type InsertUser,
  type Job,
  type InsertJob,
  type JobInterest,
  type InsertJobInterest,
  type Review,
  type InsertReview,
  type Service,
  type InsertService,
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getUserByPhone(phoneNumber: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  getUser(id: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  createJob(job: InsertJob): Promise<Job>;
  getJob(id: string): Promise<Job | undefined>;
  getJobsByFarmer(farmerId: string): Promise<Job[]>;
  updateJob(id: string, updates: Partial<Job>): Promise<Job | undefined>;
  getAllJobs(): Promise<Array<Job & { farmer: User }>>;

  expressInterest(interest: InsertJobInterest): Promise<JobInterest>;
  getJobInterests(jobId: string): Promise<Array<JobInterest & { associate: User }>>;
  getAssociateInterests(associateId: string): Promise<Array<JobInterest & { job: Job }>>;
  getAllInterests(): Promise<Array<JobInterest & { job: Job }>>;
  updateInterestStatus(jobId: string, associateId: string, status: string): Promise<void>;
  removeInterest(jobId: string, associateId: string): Promise<void>;

  createReview(review: InsertReview): Promise<Review>;
  getReviewsByAssociate(associateId: string): Promise<Array<Review & { farmer: User; job: Job }>>;
  getReviewsByJob(jobId: string): Promise<Array<Review & { farmer: User; associate: User }>>;
  deleteReview(reviewId: string): Promise<void>;

  createService(service: InsertService): Promise<Service>;
  getAllServices(): Promise<Service[]>;
  getActiveServices(): Promise<Service[]>;
  getService(id: string): Promise<Service | undefined>;
  updateService(id: string, updates: Partial<Service>): Promise<Service | undefined>;
  deleteService(id: string): Promise<void>;
}

export class DbStorage implements IStorage {
  /* ================= USERS ================= */

  async getUserByPhone(phoneNumber: string) {
    return (
      await db.select().from(users).where(eq(users.phoneNumber, phoneNumber)).limit(1)
    )[0];
  }

  async getJobsNearLocation(
  latitude: number,
  longitude: number,
  radiusKm: number,
  skillLevel?: string
): Promise<Job[]> {
  return await db
    .select()
    .from(jobs)
    .where(sql`
      ${jobs.status} = 'Open'
      AND (
        6371 * acos(
          cos(radians(${latitude}))
          * cos(radians(${jobs.latitude}))
          * cos(radians(${jobs.longitude}) - radians(${longitude}))
          + sin(radians(${latitude}))
          * sin(radians(${jobs.latitude}))
        )
      ) <= ${radiusKm}
      ${skillLevel ? sql`AND ${jobs.skillLevel} = ${skillLevel}` : sql``}
    `);
}

 async createUser(user: InsertUser) {
  const [created] = await db
    .insert(users)
    .values({
      ...user,
      skills: user.skills ?? [], 
      latitude: user.latitude ?? null,
      longitude: user.longitude ?? null,
      location: user.location ?? null,
      skillLevel: user.skillLevel ?? null,
      hourlyRate: user.hourlyRate ?? null,
      averageRating: "0",
      totalRatings: 0,
      jobsCompleted: 0,
      totalEarnings: 0,
      pendingPayments: 0,
      createdAt: new Date(),
    })
    .returning();

  return created;
}

async updateUser(id: string, updates: Partial<User>) {
  const safeUpdates = {
    ...updates,
    ...(updates.skills === null ? { skills: [] } : {}),
  };

  const [updated] = await db
    .update(users)
    .set(safeUpdates)
    .where(eq(users.id, id))
    .returning();

  return updated;
}


  async getUser(id: string) {
    return (await db.select().from(users).where(eq(users.id, id)).limit(1))[0];
  }

  async getAllUsers() {
    return await db.select().from(users);
  }

  /* ================= JOBS ================= */

  async createJob(job: InsertJob) {
    const [created] = await db
      .insert(jobs)
      .values({ ...job, status: "Open", createdAt: new Date() })
      .returning();
    return created;
  }

  async getJob(id: string) {
    return (await db.select().from(jobs).where(eq(jobs.id, id)).limit(1))[0];
  }

  async getJobsByFarmer(farmerId: string) {
    return await db.select().from(jobs).where(eq(jobs.farmerId, farmerId));
  }

  async updateJob(id: string, updates: Partial<Job>) {
    const [updated] = await db
      .update(jobs)
      .set(updates)
      .where(eq(jobs.id, id))
      .returning();
    return updated;
  }

  async getAllJobs() {
    const allJobs = await db.select().from(jobs);
    return Promise.all(
      allJobs.map(async (job) => ({
        ...job,
        farmer: (await this.getUser(job.farmerId))!,
      }))
    );
  }

  /* ================= JOB INTERESTS ================= */

  async expressInterest(interest: InsertJobInterest) {
  const existing = await db
    .select()
    .from(jobInterests)
    .where(
      and(
        eq(jobInterests.jobId, interest.jobId),
        eq(jobInterests.associateId, interest.associateId)
      )
    )
    .limit(1);

  if (existing[0]) return existing[0];

  const [created] = await db
    .insert(jobInterests)
    .values({ ...interest, status: "interested", createdAt: new Date() })
    .returning();

  return created;
}


  async getJobInterests(jobId: string) {
    const interests = await db
      .select()
      .from(jobInterests)
      .where(eq(jobInterests.jobId, jobId));

    return Promise.all(
      interests.map(async (i) => ({
        ...i,
        associate: (await this.getUser(i.associateId))!,
      }))
    );
  }

  async getAssociateInterests(associateId: string) {
    const interests = await db
      .select()
      .from(jobInterests)
      .where(eq(jobInterests.associateId, associateId));

    return Promise.all(
      interests.map(async (i) => ({
        ...i,
        job: (await this.getJob(i.jobId))!,
      }))
    );
  }

  async getAllInterests() {
    const interests = await db.select().from(jobInterests);
    return Promise.all(
      interests.map(async (i) => ({
        ...i,
        job: (await this.getJob(i.jobId))!,
      }))
    );
  }

  async updateInterestStatus(jobId: string, associateId: string, status: string) {
    await db
      .update(jobInterests)
      .set({ status })
      .where(
        and(
          eq(jobInterests.jobId, jobId),
          eq(jobInterests.associateId, associateId)
        )
      );
  }

  async removeInterest(jobId: string, associateId: string) {
    await db
      .delete(jobInterests)
      .where(
        and(
          eq(jobInterests.jobId, jobId),
          eq(jobInterests.associateId, associateId)
        )
      );
  }

  /* ================= REVIEWS ================= */

  async createReview(review: InsertReview) {
  const [created] = await db
    .insert(reviews)
    .values({ ...review, createdAt: new Date() })
    .returning();

  // Update associate average rating
  const associate = await this.getUser(review.associateId);
  if (associate) {
    const list = await db.select().from(reviews).where(eq(reviews.associateId, associate.id));
    const totalRatings = list.length;
    const avgRating = totalRatings > 0 ? list.reduce((sum, r) => sum + r.rating, 0) / totalRatings : 0;

    await this.updateUser(associate.id, {
      averageRating: avgRating.toFixed(2),
      totalRatings: totalRatings,
    });
  }

  return created;
}


  async getReviewsByAssociate(associateId: string) {
    const list = await db
      .select()
      .from(reviews)
      .where(eq(reviews.associateId, associateId));

    return Promise.all(
      list.map(async (r) => ({
        ...r,
        farmer: (await this.getUser(r.farmerId))!,
        job: (await this.getJob(r.jobId))!,
      }))
    );
  }

  async getReviewsByJob(jobId: string) {
    const list = await db
      .select()
      .from(reviews)
      .where(eq(reviews.jobId, jobId));

    return Promise.all(
      list.map(async (r) => ({
        ...r,
        farmer: (await this.getUser(r.farmerId))!,
        associate: (await this.getUser(r.associateId))!,
      }))
    );
  }

  async deleteReview(reviewId: string) {
  const review = (await db.select().from(reviews).where(eq(reviews.id, reviewId)).limit(1))[0];
  if (!review) return;

  await db.delete(reviews).where(eq(reviews.id, reviewId));

  // Update associate average rating
  const associate = await this.getUser(review.associateId);
  if (associate) {
    const list = await db.select().from(reviews).where(eq(reviews.associateId, associate.id));
    const totalRatings = list.length;
    const avgRating = totalRatings > 0 ? list.reduce((sum, r) => sum + r.rating, 0) / totalRatings : 0;

    await this.updateUser(associate.id, {
      averageRating: avgRating.toFixed(2),
      totalRatings: totalRatings,
    });
  }
}


  /* ================= SERVICES ================= */

  async createService(service: InsertService) {
    const [created] = await db
      .insert(services)
      .values({ ...service, createdAt: new Date() })
      .returning();
    return created;
  }

  async getAllServices() {
    return await db.select().from(services);
  }

  async getActiveServices() {
    return await db.select().from(services).where(eq(services.isActive, 1));
  }

  async getService(id: string) {
    return (await db.select().from(services).where(eq(services.id, id)).limit(1))[0];
  }

  async updateService(id: string, updates: Partial<Service>) {
    const [updated] = await db
      .update(services)
      .set(updates)
      .where(eq(services.id, id))
      .returning();
    return updated;
  }

  async deleteService(id: string) {
    await db.delete(services).where(eq(services.id, id));
  }

  constructor() {
  this.initializeDefaultServices();
}

private async initializeDefaultServices() {
  const existing = await db.select().from(services);
  if (existing.length > 0) return; // skip if already exists

  const defaultServices: InsertService[] = [
    { name: "Ploughing", iconName: "Tractor", isActive: 1 },
    { name: "Harvesting", iconName: "Wheat", isActive: 1 },
    { name: "Sowing", iconName: "Sprout", isActive: 1 },
    { name: "Irrigation", iconName: "Droplets", isActive: 1 },
    { name: "Fertilizing", iconName: "Bug", isActive: 1 },
    { name: "General Labour", iconName: "Users", isActive: 1 },
  ];

  for (const s of defaultServices) {
    await this.createService(s);
  }
}

}

export const storage = new DbStorage();
