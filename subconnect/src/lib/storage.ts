import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

/**
 * Private file storage. Files are never given public URLs; they are streamed through
 * /api/files/[id] after a permission check.
 */
interface Storage {
  put(key: string, body: Buffer, contentType: string): Promise<void>;
  get(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
}

class LocalStorage implements Storage {
  private root = path.resolve(process.env.LOCAL_STORAGE_DIR ?? "./storage");
  private resolve(key: string) {
    if (!/^[a-z0-9/-]+$/i.test(key)) throw new Error("Bad storage key");
    const p = path.resolve(this.root, key);
    if (!p.startsWith(this.root + path.sep)) throw new Error("Bad storage key");
    return p;
  }
  async put(key: string, body: Buffer) {
    const p = this.resolve(key);
    await fs.mkdir(path.dirname(p), { recursive: true, mode: 0o700 });
    await fs.writeFile(p, body, { mode: 0o600 });
  }
  async get(key: string) {
    return fs.readFile(this.resolve(key));
  }
  async delete(key: string) {
    await fs.rm(this.resolve(key), { force: true });
  }
}

class S3Storage implements Storage {
  private client = new S3Client({
    region: process.env.S3_REGION || "us-east-1",
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    credentials: process.env.S3_ACCESS_KEY_ID
      ? { accessKeyId: process.env.S3_ACCESS_KEY_ID, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "" }
      : undefined,
  });
  private bucket = process.env.S3_BUCKET!;
  async put(key: string, body: Buffer, contentType: string) {
    await this.client.send(
      new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: body, ContentType: contentType, ServerSideEncryption: "AES256" }),
    );
  }
  async get(key: string) {
    const res = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
    return Buffer.from(await res.Body!.transformToByteArray());
  }
  async delete(key: string) {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}

const g = globalThis as unknown as { __storage?: Storage };
export function storage(): Storage {
  g.__storage ??= process.env.STORAGE_DRIVER === "s3" ? new S3Storage() : new LocalStorage();
  return g.__storage;
}

export function newStorageKey(teacherId: string) {
  return `plans/${teacherId.replace(/[^a-z0-9]/gi, "")}/${crypto.randomUUID()}`;
}
