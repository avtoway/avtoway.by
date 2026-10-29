import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@libsql/client";

export interface BackupInfo {
  name: string;
  path: string;
  size: number;
  createdAt: string;
  integrity?: string;
  tables?: Record<string, number>;
}

function databasePath(): string {
  const url = process.env.DATABASE_URL ?? "file:./data/avtoway.db";
  if (!url.startsWith("file:")) {
    throw new Error("Резервное копирование реализовано для SQLite (DATABASE_URL=file:...)");
  }
  return path.resolve(/*turbopackIgnore: true*/ process.cwd(), url.slice("file:".length));
}

function backupDirectory(): string {
  return path.join(/*turbopackIgnore: true*/ process.cwd(), "backups");
}

export async function listBackups(): Promise<BackupInfo[]> {
  const directory = backupDirectory();
  await mkdir(directory, { recursive: true });
  const files = (await readdir(directory)).filter(file => file.endsWith(".db"));
  const items = await Promise.all(files.map(async file => {
    const fullPath = path.join(directory, file);
    const info = await stat(fullPath);
    return {
      name: file,
      path: fullPath,
      size: info.size,
      createdAt: info.mtime.toISOString(),
    };
  }));
  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createBackup(): Promise<BackupInfo> {
  const sourcePath = databasePath();
  const directory = backupDirectory();
  await mkdir(directory, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const name = `avtoway-${stamp}.db`;
  const destination = path.join(directory, name);

  const client = createClient({ url: `file:${sourcePath}` });
  try {
    await client.execute(`VACUUM INTO '${destination.replace(/'/g, "''")}'`);
  } finally {
    client.close();
  }

  const info = await verifyBackup(destination);
  return { ...info, name, path: destination, createdAt: new Date().toISOString() };
}

export async function verifyBackup(filePath: string): Promise<BackupInfo> {
  const client = createClient({ url: `file:${filePath}` });
  try {
    const integrityResult = await client.execute("PRAGMA integrity_check");
    const integrity = String(integrityResult.rows[0]?.integrity_check ?? "unknown");
    const tables: Record<string, number> = {};
    const tableNames = ["users", "services", "service_landings", "contact_requests", "rent_requests", "sale_requests", "autopodbor_leads"];
    for (const table of tableNames) {
      try {
        const result = await client.execute(`SELECT COUNT(*) AS count FROM ${table}`);
        tables[table] = Number(result.rows[0]?.count ?? 0);
      } catch {
        tables[table] = -1;
      }
    }
    const info = await stat(filePath);
    return {
      name: path.basename(filePath),
      path: filePath,
      size: info.size,
      createdAt: info.mtime.toISOString(),
      integrity,
      tables,
    };
  } finally {
    client.close();
  }
}

export async function verifyLatestBackup(): Promise<BackupInfo | null> {
  const [latest] = await listBackups();
  if (!latest) return null;
  return verifyBackup(latest.path);
}
