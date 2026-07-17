export type PageRecord = {
  id: string;
  projectId: string;
  name: string;
  slug: string;
  content: unknown | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreatePageInput = {
  projectId: string;
  name: string;
  slug: string;
  content?: unknown | null;
};

export type UpdatePageInput = Partial<Omit<CreatePageInput, "projectId">>;

export interface IPageRepository {
  findById(id: string): Promise<PageRecord | null>;
  findByProjectAndSlug(projectId: string, slug: string): Promise<PageRecord | null>;
  create(data: CreatePageInput): Promise<PageRecord>;
  update(id: string, data: UpdatePageInput): Promise<PageRecord>;
  delete(id: string): Promise<void>;
  listByProject(projectId: string): Promise<PageRecord[]>;
}
