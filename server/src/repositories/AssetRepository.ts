export type AssetRecord = {
  id: string;
  projectId: string;
  type: string;
  name: string | null;
  url: string;
  storagePath: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  metadata: unknown | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateAssetInput = {
  projectId: string;
  type: string;
  url: string;
  name?: string | null;
  storagePath?: string | null;
  mimeType?: string | null;
  sizeBytes?: number | null;
  metadata?: unknown | null;
};

export type UpdateAssetInput = Partial<Omit<CreateAssetInput, "projectId">>;

/**
 * Assets store metadata + url/path only.
 * Do not persist large base64 blobs in Page/Version JSON when migrating (Stage 4+).
 */
export interface IAssetRepository {
  findById(id: string): Promise<AssetRecord | null>;
  create(data: CreateAssetInput): Promise<AssetRecord>;
  update(id: string, data: UpdateAssetInput): Promise<AssetRecord>;
  delete(id: string): Promise<void>;
  listByProject(projectId: string, type?: string): Promise<AssetRecord[]>;
}
