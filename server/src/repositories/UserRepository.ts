export type UserRecord = {
  id: string;
  email: string;
  username: string | null;
  passwordHash: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateUserInput = {
  email: string;
  username?: string | null;
  passwordHash?: string | null;
  role?: string | null;
};

export type UpdateUserInput = Partial<CreateUserInput>;

/**
 * Persistent user store (Stage 8).
 * Frontend login still uses Vite CMS auth plugin until a later stage.
 */
export interface IUserRepository {
  findById(id: string): Promise<UserRecord | null>;
  findByEmail(email: string): Promise<UserRecord | null>;
  create(data: CreateUserInput): Promise<UserRecord>;
  update(id: string, data: UpdateUserInput): Promise<UserRecord>;
  delete(id: string): Promise<void>;
}
