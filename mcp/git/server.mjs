#!/usr/bin/env node
/**
 * MCP-сервер для работы с Git и GitHub.
 *
 * Локальный git: состояние, история, diff, ветки, коммиты, merge/rebase,
 * stash, теги, worktree, submodule, remote, push/pull/clone, обслуживание.
 * GitHub (через gh CLI): repo, PR, issues, releases, Actions, произвольный API.
 *
 * Запуск: node mcp/git/server.mjs (stdio).
 * Настройки окружения:
 *   GIT_MCP_ALLOWED_ROOTS  — доп. каталоги, где разрешено работать (разделитель — ; в Windows)
 *   GIT_MCP_DRY_RUN=1      — не выполнять изменяющие команды, только показывать их
 *   GIT_MCP_MAX_OUTPUT_CHARS — лимит символов в ответе (по умолчанию 60000)
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { git } from "./lib/exec.mjs";
import { ALLOWED_ROOTS, PROJECT_ROOT } from "./lib/paths.mjs";
import { isMutatingEnvDryRun } from "./lib/exec.mjs";
import { registerReadTools } from "./tools/read.mjs";
import { registerWriteTools } from "./tools/write.mjs";
import { registerRemoteTools } from "./tools/remote.mjs";
import { registerGitHubTools } from "./tools/github.mjs";

const log = (message) => process.stderr.write(`[git-mcp] ${message}\n`);

const server = new McpServer(
  { name: "git", version: "1.0.0" },
  {
    instructions: [
      "Инструменты Git и GitHub для этого проекта.",
      "",
      "Правила:",
      "1. Перед изменениями вызывай git_status, чтобы увидеть состояние рабочей копии.",
      "2. Разрушительные операции (reset --hard, clean, удаление веток/тегов, force push, stash drop, удаление репозитория) требуют confirm=true — сначала согласуй с пользователем.",
      "3. Не коммить и не пушить без явной просьбы. Не используй git add -A/--all, если пользователь просил закоммитить только часть изменений.",
      "4. Для истории используй git_log с фильтрами, для диффов — git_diff (staged/ref/from+to), для содержания коммита — git_show.",
      "5. GitHub-операции — через gh_* (нужен gh auth login). Для редких случаев есть gh_api.",
      "6. Все пути считаются от корня проекта; работать можно только внутри разрешённых каталогов.",
    ].join("\n"),
  },
);

registerReadTools(server, z);
registerWriteTools(server, z);
registerRemoteTools(server, z);
registerGitHubTools(server, z);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  const version = await git(["--version"]).catch(() => null);
  log(`запущен (${version?.stdout.trim() || "git не найден"})`);
  log(`корень проекта: ${PROJECT_ROOT}`);
  if (ALLOWED_ROOTS.length > 1) log(`доп. разрешённые каталоги: ${ALLOWED_ROOTS.slice(1).join(", ")}`);
  if (isMutatingEnvDryRun()) log("включён режим GIT_MCP_DRY_RUN: изменяющие команды только показываются");
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    log(`получен ${signal}, завершение`);
    await server.close().catch(() => {});
    process.exit(0);
  });
}

main().catch((error) => {
  log(`не удалось запустить: ${error?.stack || error}`);
  process.exit(1);
});
