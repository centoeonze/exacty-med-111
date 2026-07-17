export type VersionRecord = {
  id: string;
  projectId: string;
  pageId: string | null;
  status: string;
  label: string | null;
  content: unknown;
  createdAt: Date;
};

export type CreateVersionInput = {
  projectId: string;
  pageId?: string | null;
  status: string;
  label?: string | null;
  content: unknown;
};

export interface IVersionRepository {
  findById(id: string): Promise<VersionRecord | null>;
  create(data: CreateVersionInput): Promise<VersionRecord>;
  listByProject(projectId: string, status?: string): Promise<VersionRecord[]>;
  delete(id: string): Promise<void>;
}
