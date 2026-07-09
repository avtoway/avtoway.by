import { MemoryServiceRepository } from "@/entities/service/service.memory.repository";
import type { ServiceRepository } from "@/entities/service/service.repository";

class Container {
  private _serviceRepo: ServiceRepository | null = null;

  getServiceRepository(): ServiceRepository {
    if (!this._serviceRepo) {
      this._serviceRepo = new MemoryServiceRepository();
    }
    return this._serviceRepo;
  }
}

export const container = new Container();
