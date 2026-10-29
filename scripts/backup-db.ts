import { createBackup, listBackups, verifyLatestBackup } from "../src/shared/lib/backup.server";

async function main() {
  const mode = process.argv[2] ?? "create";
  if (mode === "check") {
    const latest = await verifyLatestBackup();
    if (!latest) {
      console.error("Резервные копии не найдены");
      process.exitCode = 1;
      return;
    }
    console.log(JSON.stringify(latest, null, 2));
    if (latest.integrity !== "ok") process.exitCode = 1;
    return;
  }

  const backup = await createBackup();
  console.log(JSON.stringify(backup, null, 2));
  console.log("Всего резервных копий:", (await listBackups()).length);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
