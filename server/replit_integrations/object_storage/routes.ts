import type { Express } from "express";
import multer from "multer";
import { S3StorageService } from "../../s3Storage";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export function registerObjectStorageRoutes(app: Express): void {
  const s3Service = new S3StorageService();

  app.post("/api/uploads/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
      }

      const objectPath = await s3Service.uploadFile(
        req.file.buffer,
        req.file.mimetype
      );

      res.json({
        objectPath,
        metadata: {
          name: req.file.originalname,
          size: req.file.size,
          contentType: req.file.mimetype,
        },
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });
}
