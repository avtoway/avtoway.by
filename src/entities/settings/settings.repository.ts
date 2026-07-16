export interface SettingsRepository {
  get<T>(key: string): Promise<T | null>;
  getAll(): Promise<Record<string, string>>;
}
