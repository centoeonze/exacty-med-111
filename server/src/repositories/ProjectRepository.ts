export type ProjectRecord = {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateProjectInput = {
  name: string;
  slug: string;
};

export type UpdateProjectInput = Partial<CreateProjectInput>;

export interface IProjectRepository {
  findById(id: string): Promise<ProjectRecord | null>;
  findBySlug(slug: string): Promise<ProjectRecord | null>;
  create(data: CreateProjectInput): Promise<ProjectRecord>;
  update(id: string, data: UpdateProjectInput): Promise<ProjectRecord>;
  delete(id: string): Promise<void>;
  list(): Promise<ProjectRecord[]>;
}
