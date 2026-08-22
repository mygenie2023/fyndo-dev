import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { Response } from "express";
import { randomUUID } from "crypto";
import { Readable } from "stream";

const AWS_REGION = process.env.AWS_REGION || "ap-south-1";
const AWS_BUCKET = process.env.AWS_S3_BUCKET || "fyndo-assets";

const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY || "",
    secretAccessKey: process.env.AWS_SECRET_KEY || "",
  },
});

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class S3StorageService {
  private bucket: string;

  constructor() {
    this.bucket = AWS_BUCKET;
  }

  async uploadFile(fileBuffer: Buffer, contentType: string): Promise<string> {
    const objectId = randomUUID();
    const key = `uploads/${objectId}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await s3Client.send(command);
    return `/objects/${key}`;
  }

  extractKeyFromObjectPath(objectPath: string): string {
    if (objectPath.startsWith("/objects/")) {
      return objectPath.slice("/objects/".length);
    }
    throw new ObjectNotFoundError();
  }

  async downloadObject(objectPath: string, res: Response, cacheTtlSec: number = 3600): Promise<void> {
    try {
      const key = this.extractKeyFromObjectPath(objectPath);

      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await s3Client.send(command);

      if (!response.Body) {
        throw new ObjectNotFoundError();
      }

      res.set({
        "Content-Type": response.ContentType || "application/octet-stream",
        "Cache-Control": `private, max-age=${cacheTtlSec}`,
      });

      if (response.ContentLength) {
        res.set("Content-Length", String(response.ContentLength));
      }

      const stream = response.Body as Readable;
      stream.on("error", (err) => {
        console.error("S3 stream error:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Error streaming file" });
        }
      });

      stream.pipe(res);
    } catch (error: any) {
      if (error?.name === "NoSuchKey" || error instanceof ObjectNotFoundError) {
        throw new ObjectNotFoundError();
      }
      throw error;
    }
  }

  async objectExists(objectPath: string): Promise<boolean> {
    try {
      const key = this.extractKeyFromObjectPath(objectPath);
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await s3Client.send(command);
      return true;
    } catch {
      return false;
    }
  }
}
