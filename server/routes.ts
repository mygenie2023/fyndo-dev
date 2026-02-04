import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertJobSchema, insertJobInterestSchema, insertReviewSchema, adminLoginSchema, insertServiceSchema } from "@shared/schema";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "$MartApp2025";

const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const session = req.session as any;
  if (session && session.isAdmin) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized - Admin access required" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Register object storage routes for file uploads
  registerObjectStorageRoutes(app);
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      let user = await storage.getUserByPhone(phoneNumber);
      
      if (!user) {
        return res.json({ exists: false });
      }
      
      res.json({ exists: true, user });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/complete-profile", async (req, res) => {
    try {
      const skills: string[] =
        Array.isArray(req.body.skills)
          ? req.body.skills.map((s: any) => String(s))
          : [];
      const userData = {
        ...req.body,
        skills,
      };
      const parsedData = insertUserSchema.parse(userData);
      const existingUser = await storage.getUserByPhone(parsedData.phoneNumber);
      
      if (existingUser) {
        const updated = await storage.updateUser(existingUser.id, { ...parsedData, skills: skills ?? [] });
        return res.json(updated);
      }
      
      const user = await storage.createUser({ ...parsedData, skills: skills ?? [] });
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Profile setup failed" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const updated = await storage.updateUser(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: "Failed to update user" });
    }
  });

  // Admin: Create new user (farmer or associate) - requires admin authentication
  app.post("/api/admin/users", requireAdmin, async (req, res) => {
    try {

      const skills: string[] =
           Array.isArray(req.body.skills)
          ? req.body.skills.map((s: any) => String(s))
          : [];
      const userData = {
        ...req.body,
        skills,
      };
      const parsedData = insertUserSchema.parse(userData);
      
      // Check if user already exists
      const existingUser = await storage.getUserByPhone(parsedData.phoneNumber);
      if (existingUser) {
        return res.status(400).json({ error: "User with this phone number already exists" });
      }
      
      const user = await storage.createUser({ ...parsedData, skills: skills ?? [] });
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Failed to create user" });
    }
  });

  app.post("/api/jobs", async (req, res) => {
    try {
      const jobData = insertJobSchema.parse(req.body);
      const job = await storage.createJob(jobData);
      res.json(job);
    } catch (error) {
      res.status(400).json({ error: "Failed to create job" });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch job" });
    }
  });

  app.get("/api/jobs/farmer/:farmerId", async (req, res) => {
    try {
      const jobs = await storage.getJobsByFarmer(req.params.farmerId);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch jobs" });
    }
  });

  app.get("/api/jobs/nearby/:latitude/:longitude", async (req, res) => {
    try {
      const { latitude, longitude } = req.params;
      const { skillLevel } = req.query;
      
      const jobs = await storage.getJobsNearLocation(
        parseFloat(latitude),
        parseFloat(longitude),
        20,
        skillLevel as string | undefined
      );
      
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch nearby jobs" });
    }
  });

  app.patch("/api/jobs/:id", async (req, res) => {
    try {
      const updated = await storage.updateJob(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: "Failed to update job" });
    }
  });

  app.post("/api/job-interests", async (req, res) => {
    try {
      const interestData = insertJobInterestSchema.parse(req.body);
      const interest = await storage.expressInterest(interestData);
      res.json(interest);
    } catch (error) {
      res.status(400).json({ error: "Failed to express interest" });
    }
  });

  app.get("/api/job-interests/job/:jobId", async (req, res) => {
    try {
      const interests = await storage.getJobInterests(req.params.jobId);
      res.json(interests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch interests" });
    }
  });

  app.get("/api/job-interests/associate/:associateId", async (req, res) => {
    try {
      const interests = await storage.getAssociateInterests(req.params.associateId);
      res.json(interests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch interests" });
    }
  });

  app.patch("/api/job-interests/:jobId/:associateId", async (req, res) => {
    try {
      const { status } = req.body;
      await storage.updateInterestStatus(req.params.jobId, req.params.associateId, status);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to update interest" });
    }
  });

  app.delete("/api/job-interests/:jobId/:associateId", async (req, res) => {
    try {
      await storage.removeInterest(req.params.jobId, req.params.associateId);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to remove interest" });
    }
  });

  app.patch("/api/users/:id/skills", async (req, res) => {
    try {
      const { skills } = req.body;
      const updated = await storage.updateUser(req.params.id, { skills });
      if (!updated) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: "Failed to update skills" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(reviewData);
      res.json(review);
    } catch (error) {
      res.status(400).json({ error: "Failed to create review" });
    }
  });

  app.get("/api/reviews/associate/:associateId", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByAssociate(req.params.associateId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  // Admin routes
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = adminLoginSchema.parse(req.body);
      
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {          
        const session = req.session as any;
        session.isAdmin = true;
        session.adminUsername = ADMIN_USERNAME;
        
        const adminSession = {
          id: "admin",
          username: ADMIN_USERNAME,
          isAdmin: true,
        };
        res.json({ success: true, admin: adminSession });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (error) {
      res.status(400).json({ error: "Login failed" });
    }
  });

  app.post("/api/admin/logout", requireAdmin, async (req, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        res.status(500).json({ error: "Logout failed" });
      } else {
        res.json({ success: true });
      }
    });
  });

  app.get("/api/admin/jobs", requireAdmin, async (req, res) => {
    try {
      const jobs = await storage.getAllJobs();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch jobs" });
    }
  });

  app.post("/api/admin/jobs", requireAdmin, async (req, res) => {
    try {
      const jobData = insertJobSchema.parse(req.body);
      const job = await storage.createJob(jobData);
      res.json(job);
    } catch (error) {
      res.status(400).json({ error: "Failed to create job" });
    }
  });

  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Get all job interests for admin (to count interested associates per job)
  app.get("/api/admin/all-interests", requireAdmin, async (req, res) => {
    try {
      const interests = await storage.getAllInterests();
      res.json(interests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch interests" });
    }
  });

  app.get("/api/admin/reviews/job/:jobId", requireAdmin, async (req, res) => {
    try {
      const reviews = await storage.getReviewsByJob(req.params.jobId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.delete("/api/admin/reviews/:reviewId", requireAdmin, async (req, res) => {
    try {
      await storage.deleteReview(req.params.reviewId);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete review" });
    }
  });

  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getActiveServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  app.get("/api/admin/services", requireAdmin, async (req, res) => {
    try {
      const services = await storage.getAllServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  app.post("/api/admin/services", requireAdmin, async (req, res) => {
    try {
      const serviceData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(serviceData);
      res.json(service);
    } catch (error) {
      res.status(400).json({ error: "Failed to create service" });
    }
  });

  app.patch("/api/admin/services/:id", requireAdmin, async (req, res) => {
    try {
      const updateSchema = insertServiceSchema.partial();
      const validatedUpdates = updateSchema.parse(req.body);

      if (Object.keys(validatedUpdates).length === 0) {
        return res.status(400).json({ error: "No valid fields to update" });
      }

      const updated = await storage.updateService(req.params.id, validatedUpdates);
      if (!updated) {
        return res.status(404).json({ error: "Service not found" });
      }
      res.json(updated);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid service data", details: error.errors });
      }
      res.status(400).json({ error: "Failed to update service" });
    }
  });

  app.delete("/api/admin/services/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteService(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete service" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
