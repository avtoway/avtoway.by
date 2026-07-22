import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
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

  for (const r of roleDefs) {
    const existing = await prisma.role.findUnique({ where: { name: r.name } });
    if (existing) {
      if (!existing.level) await prisma.role.update({ where: { id: existing.id }, data: { level: r.level, description: r.description } });
      continue;
    }
    await prisma.role.create({
      data: {
        name: r.name,
        description: r.description,
        level: r.level,
        permissions: {
          create: (perms[r.name] ?? []).map(p => ({ permission: p })),
        },
      },
    });
  }

  const admin = await prisma.user.findUnique({ where: { login: "admin" } });
  let userId: string;
  if (admin) {
    userId = admin.id;
    console.log("Admin user exists");
  } else {
    const password = await bcrypt.hash("admin123", 10);
    const user = await prisma.user.create({
      data: {
        login: "admin",
        password,
        profile: {
          create: {
            name: "Admin",
            email: "admin@avtoway.by",
            phone: "+375 (29) 111-11-11",
            position: "Главный администратор",
            birthDate: "1990-01-01",
            workSchedule: "full_time",
            hireDate: "2024-01-15",
          },
        },
      },
    });
    userId = user.id;
  }

  const allRoles = await prisma.role.findMany();
  await prisma.userRole.deleteMany({ where: { userId } });
  for (const role of allRoles) {
    await prisma.userRole.create({ data: { userId, roleId: role.id } });
  }

  console.log("База данных готова");
  console.log("  Логин: admin / admin123");
  console.log("  Роли: Администратор, Редактор, Наблюдатель");
}

main().catch((e) => { console.error("Seed failed:", e); process.exit(1); }).finally(() => prisma.$disconnect());
