import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { PrismaClient } from "@prisma/client";
import { getPrismaClient } from "../repositories/SqliteStorageRepository.js";
import {
  PrismaAssetRepository,
  PrismaProjectRepository,
} from "../repositories/prismaCmsRepositories.js";
import type { AssetRecord } from "../repositories/AssetRepository.js";

const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
]);

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB

export type AssetUploadInput = {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  projectId?: string;
  type?: string;
};

export type AssetServiceOptions = {
  prisma?: PrismaClient;
  uploadsDir?: string;
  publicPathPrefix?: string;
};

const extFromMime = (mime: string, originalName: string) => {
  const fromName = path.extname(originalName).replace(/^\./, "").toLowerCase();
  if (fromName) return fromName;
  if (mime.includes("pdf")) return "pdf";
  if (mime.includes("png")) return "png";
  if (mime.includes("jpeg") || mime.includes("jpg")) return "jpg";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("gif")) return "gif";
  if (mime.includes("svg")) return "svg";
  return "bin";
};

const inferType = (mime: string, explicit?: string) => {
  if (explicit) return explicit;
  if (mime.includes("pdf")) return "pdf";
  if (mime.startsWith("image/")) return "image";
  return "file";
};

/**
 * Persists uploaded files on disk and metadata in Prisma Asset (no base64 in DB).
 */
export class AssetService {
  private readonly prisma: PrismaClient;
  private readonly uploadsDir: string;
  private readonly publicPathPrefix: string;
  private readonly assets: PrismaAssetRepository;
  private readonly projects: PrismaProjectRepository;

  constructor(options: AssetServiceOptions = {}) {
    this.prisma = options.prisma ?? getPrismaClient();
    this.uploadsDir =
      options.uploadsDir ?? path.resolve(process.cwd(), "uploads");
    this.publicPathPrefix = options.publicPathPrefix ?? "/uploads";
    this.assets = new PrismaAssetRepository(this.prisma);
    this.projects = new PrismaProjectRepository(this.prisma);
  }

  validateUpload(input: Pick<AssetUploadInput, "buffer" | "mimeType">): void {
    if (!input.buffer?.length) {
      throw new AssetServiceError(400, "Empty file");
    }
    if (input.buffer.length > MAX_BYTES) {
      throw new AssetServiceError(400, `File exceeds ${MAX_BYTES} bytes`);
    }
    const mime = (input.mimeType || "").toLowerCase();
    if (!ALLOWED_MIME.has(mime) && mime !== "image/jpg") {
      throw new AssetServiceError(400, `Unsupported mime type: ${mime || "(missing)"}`);
    }
  }

  /** Reject data:/blob URLs — Stage 8 stores files, not embedded payloads. */
  assertNotEmbeddedPayload(url: string): void {
    const lower = url.trim().toLowerCase();
    if (lower.startsWith("data:") || lower.startsWith("blob:")) {
      throw new AssetServiceError(
        400,
        "Base64/blob URLs are not allowed; upload the file to /api/assets/upload",
      );
    }
  }

  async resolveProjectId(projectId?: string): Promise<string> {
    if (projectId) {
      const existing = await this.projects.findById(projectId);
      if (!existing) throw new AssetServiceError(404, "Project not found");
      return existing.id;
    }
    const slug = "exacty-med";
    const found = await this.projects.findBySlug(slug);
    if (found) return found.id;
    const created = await this.projects.create({
      name: "Exacty Med",
      slug,
    });
    return created.id;
  }

  async upload(input: AssetUploadInput): Promise<AssetRecord> {
    this.validateUpload(input);
    const projectId = await this.resolveProjectId(input.projectId);
    fs.mkdirSync(this.uploadsDir, { recursive: true });

    const mime = input.mimeType.toLowerCase() === "image/jpg" ? "image/jpeg" : input.mimeType;
    const ext = extFromMime(mime, input.originalName);
    const safeBase = (input.originalName || "asset")
      .replace(/\.[^.]+$/, "")
      .replace(/[^\w.-]+/g, "_")
      .slice(0, 80);
    const filename = `${randomUUID()}-${safeBase}.${ext}`;
    const abs = path.join(this.uploadsDir, filename);
    fs.writeFileSync(abs, input.buffer);

    const storagePath = path.join("uploads", filename).replace(/\\/g, "/");
    const url = `${this.publicPathPrefix}/${filename}`;

    return this.assets.create({
      projectId,
      type: inferType(mime, input.type),
      name: input.originalName || filename,
      url,
      storagePath,
      mimeType: mime,
      sizeBytes: input.buffer.length,
      metadata: {
        uploadedVia: "AssetService",
        originalName: input.originalName,
      },
    });
  }

  async getById(id: string): Promise<AssetRecord> {
    const row = await this.assets.findById(id);
    if (!row) throw new AssetServiceError(404, "Asset not found");
    return row;
  }

  async delete(id: string): Promise<void> {
    const row = await this.assets.findById(id);
    if (!row) throw new AssetServiceError(404, "Asset not found");

    if (row.storagePath) {
      const filename = path.basename(row.storagePath);
      const abs = path.join(this.uploadsDir, filename);
      if (fs.existsSync(abs)) {
        fs.unlinkSync(abs);
      }
    }

    await this.assets.delete(id);
  }
}

export class AssetServiceError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "AssetServiceError";
  }
}
