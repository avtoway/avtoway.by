import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { resolve, dirname } from "node:path";
import { mkdirSync, existsSync } from "node:fs";

const dbFile = resolve("data/avtoway.db");
const dbDir = dirname(dbFile);
if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true });

const db = createClient({ url: "file:" + dbFile });

async function main() {
  await db.execute(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, login TEXT NOT NULL UNIQUE, password TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);
  await db.execute(`CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT '', email TEXT, phone TEXT, photo TEXT, position TEXT,
    birth_date TEXT, telegram TEXT, work_schedule TEXT DEFAULT 'full_time', hire_date TEXT, bio TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);
  await db.execute(`CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE, description TEXT, level INTEGER DEFAULT 0
  )`);
  await db.execute(`CREATE TABLE IF NOT EXISTS role_permissions (
    role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission TEXT NOT NULL, PRIMARY KEY (role_id, permission)
  )`);
  await db.execute(`CREATE TABLE IF NOT EXISTS user_roles (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE, PRIMARY KEY (user_id, role_id)
  )`);
  await db.execute(`CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, action TEXT NOT NULL,
    entity TEXT NOT NULL, entity_id TEXT NOT NULL, details TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  // Seed roles
  const roleDefs = [
    { name: "Администратор", description: "Полный доступ", level: 100 },
    { name: "Редактор", description: "Управление услугами и партнёрами", level: 50 },
    { name: "Наблюдатель", description: "Только просмотр", level: 10 },
  ];
  const perms: Record<string, string[]> = {
    "Администратор": ["users.manage", "users.roles", "services.manage", "partners.manage", "audit.view"],
    "Редактор": ["services.manage", "partners.manage"],
    "Наблюдатель": ["services.view", "partners.view"],
  };
  const roleIds: Record<string, string> = {};
  for (const r of roleDefs) {
    const existing = await db.execute({ sql: "SELECT id, level FROM roles WHERE name = ?", args: [r.name] });
    const row = existing.rows[0] as { id?: string; level?: number } | undefined;
    if (row?.id) {
      roleIds[r.name] = row.id;
      if (!row.level || row.level === 0) {
        await db.execute({ sql: "UPDATE roles SET level = ?, description = ? WHERE id = ?", args: [r.level, r.description, row.id] });
      }
      continue;
    }
    const id = randomUUID(); roleIds[r.name] = id;
    await db.execute({ sql: "INSERT INTO roles (id, name, description, level) VALUES (?, ?, ?, ?)", args: [id, r.name, r.description, r.level] });
    for (const perm of perms[r.name] ?? []) {
      await db.execute({ sql: "INSERT INTO role_permissions (role_id, permission) VALUES (?, ?)", args: [id, perm] });
    }
  }

  // Seed admin user
  const existing = await db.execute({ sql: "SELECT id FROM users WHERE login = ?", args: ["admin"] });
  let userId: string;
  if (existing.rows[0]) {
    userId = (existing.rows[0] as unknown as { id: string }).id;
    console.log("Admin user exists, updating...");
  } else {
    const password = await bcrypt.hash("admin123", 10);
    userId = randomUUID();
    await db.execute({ sql: "INSERT INTO users (id, login, password) VALUES (?, ?, ?)", args: [userId, "admin", password] });
  }

  // Create/update profile
  const prof = await db.execute({ sql: "SELECT id FROM profiles WHERE user_id = ?", args: [userId] });
  if (!prof.rows[0]) {
    await db.execute({
      sql: `INSERT INTO profiles (id, user_id, name, email, phone, position, birth_date, work_schedule, hire_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [randomUUID(), userId, "Admin", "admin@avtoway.by", "+375 (29) 111-11-11",
        "Главный администратор", "1990-01-01", "full_time", "2024-01-15"],
    });
  }

  // Assign all roles to admin
  await db.execute({ sql: "DELETE FROM user_roles WHERE user_id = ?", args: [userId] });
  for (const id of Object.values(roleIds)) {
    await db.execute({ sql: "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)", args: [userId, id!] });
  }

  console.log("База данных готова");
  console.log("  Логин: admin / admin123");
  console.log("  Роли: Администратор, Редактор, Наблюдатель");
}

main().catch((e) => { console.error("Seed failed:", e); process.exit(1); });
