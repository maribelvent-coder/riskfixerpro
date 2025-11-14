import { Storage, File } from "@google-cloud/storage";
import { Response } from "express";
import { randomUUID } from "crypto";

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

export const objectStorageClient = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
    type: "external_account",
    credential_source: {
      url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
      format: {
        type: "json",
        subject_token_field_name: "access_token",
      },
    },
    universe_domain: "googleapis.com",
  },
  projectId: "",
});

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class ObjectStorageService {
  constructor() {}

  getPrivateObjectDir(): string {
    const dir = process.env.PRIVATE_OBJECT_DIR || "";
    if (!dir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' tool and set PRIVATE_OBJECT_DIR env var."
      );
    }
    return dir;
  }

  async uploadEvidence(
    buffer: Buffer,
    filename: string,
    assessmentId: string,
    questionId: string
  ): Promise<string> {
    const privateObjectDir = this.getPrivateObjectDir();
    const objectId = randomUUID();
    const ext = filename.split('.').pop() || 'jpg';
    const objectName = `${assessmentId}/${questionId}/${objectId}.${ext}`;
    const fullPath = `${privateObjectDir}/${objectName}`;

    const { bucketName, objectName: parsedObjectName } = parseObjectPath(fullPath);
    const bucket = objectStorageClient.bucket(bucketName);
    const file = bucket.file(parsedObjectName);

    await file.save(buffer, {
      metadata: {
        contentType: getContentType(ext),
        metadata: {
          assessmentId,
          questionId,
          originalFilename: filename,
        },
      },
    });

    return `/evidence/${objectName}`;
  }

  async deleteEvidence(evidencePath: string): Promise<void> {
    if (!evidencePath.startsWith('/evidence/')) {
      throw new ObjectNotFoundError();
    }

    const objectName = evidencePath.slice(10); // Remove '/evidence/'
    const privateObjectDir = this.getPrivateObjectDir();
    const fullPath = `${privateObjectDir}/${objectName}`;

    const { bucketName, objectName: parsedObjectName } = parseObjectPath(fullPath);
    const bucket = objectStorageClient.bucket(bucketName);
    const file = bucket.file(parsedObjectName);

    const [exists] = await file.exists();
    if (!exists) {
      throw new ObjectNotFoundError();
    }

    await file.delete();
  }

  async getEvidenceFile(evidencePath: string): Promise<File> {
    if (!evidencePath.startsWith('/evidence/')) {
      throw new ObjectNotFoundError();
    }

    const objectName = evidencePath.slice(10); // Remove '/evidence/'
    const privateObjectDir = this.getPrivateObjectDir();
    const fullPath = `${privateObjectDir}/${objectName}`;

    const { bucketName, objectName: parsedObjectName } = parseObjectPath(fullPath);
    const bucket = objectStorageClient.bucket(bucketName);
    const file = bucket.file(parsedObjectName);

    const [exists] = await file.exists();
    if (!exists) {
      throw new ObjectNotFoundError();
    }

    return file;
  }

  async downloadEvidence(file: File, res: Response) {
    try {
      const [metadata] = await file.getMetadata();
      res.set({
        "Content-Type": metadata.contentType || "image/jpeg",
        "Content-Length": metadata.size,
        "Cache-Control": "private, max-age=3600",
      });

      const stream = file.createReadStream();
      stream.on("error", (err) => {
        console.error("Stream error:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Error streaming file" });
        }
      });

      stream.pipe(res);
    } catch (error) {
      console.error("Error downloading file:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error downloading file" });
      }
    }
  }
}

function parseObjectPath(path: string): {
  bucketName: string;
  objectName: string;
} {
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  const pathParts = path.split("/");
  if (pathParts.length < 3) {
    throw new Error("Invalid path: must contain at least a bucket name");
  }

  const bucketName = pathParts[1];
  const objectName = pathParts.slice(2).join("/");

  return {
    bucketName,
    objectName,
  };
}

function getContentType(ext: string): string {
  const types: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    heic: 'image/heic',
  };
  return types[ext.toLowerCase()] || 'application/octet-stream';
}
