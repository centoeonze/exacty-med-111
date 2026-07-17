import type { IStorageRepository } from "../repositories/IStorageRepository.js";

export class StorageService {
  constructor(private readonly repository: IStorageRepository) {}

  get(key: string) {
    return this.repository.get(key);
  }

  set(key: string, value: unknown) {
    return this.repository.set(key, value);
  }

  remove(key: string) {
    return this.repository.remove(key);
  }
}
