import type { SettingsRepository } from "@/entities/settings/settings.repository";

export class MemorySettingsRepository implements SettingsRepository {
  private store = new Map<string, string>();

  async get<T>(key: string): Promise<T | null> {
    const value = this.store.get(key);
    return value ? (JSON.parse(value) as T) : null;
  }

  async getAll(): Promise<Record<string, string>> {
    return Object.fromEntries(this.store);
  }
}
