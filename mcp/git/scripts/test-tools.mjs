/**
 * Интеграционный тест инструментов на временном репозитории.
 *
 * Создаёт песочницу в системном temp, поднимает сервер с
 * GIT_MCP_ALLOWED_ROOTS=<песочница> и прогоняет сценарии:
 * init → add/commit → branch/merge → tag → stash → worktree →
 * bare-remote → push → clone → reset/clean.
 *
 * Запуск: npm run test:tools (из mcp/git)
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync, appendFileSync, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const serverPath = path.resolve(here, "..", "server.mjs");

const sandbox = mkdtempSync(path.join(os.tmpdir(), "git-mcp-test-"));
const repo = path.join(sandbox, "repo");
const worktree = path.join(sandbox, "wt");
const bare = path.join(sandbox, "remote.git");
const clone = path.join(sandbox, "clone");

const transport = new StdioClientTransport({
  command: process.execPath,
  args: [serverPath],
  cwd: sandbox,
  env: { ...process.env, GIT_MCP_ALLOWED_ROOTS: sandbox, GIT_MCP_MAX_OUTPUT_CHARS: "20000" },
  stderr: "inherit",
});

const client = new Client({ name: "git-mcp-integration", version: "1.0.0" });

let passed = 0;
let failed = 0;

function textOf(result) {
  return result?.content?.find((entry) => entry.type === "text")?.text ?? "";
}

async function call(name, args, { expectError = false } = {}) {
  const result = await client.callTool({ name, arguments: args });
  const body = textOf(result);
  const isError = Boolean(result.isError);
  if (expectError) {
    if (!isError) throw new Error(`${name}: ожидалась ошибка, получено:\n${body}`);
  } else if (isError) {
    throw new Error(`${name}: неожиданная ошибка:\n${body}`);
  }
  return body;
}

function check(label, condition, detail = "") {
  if (condition) {
    passed += 1;
    console.log(`  ✓ ${label}`);
  } else {
    failed += 1;
    console.error(`  ✗ ${label}${detail ? `\n    ${detail}` : ""}`);
  }
}

try {
  await client.connect(transport);

  console.log("\n# init / add / commit");
  await call("git_init", { directory: repo, initial_branch: "main" });
  writeFileSync(path.join(repo, "app.txt"), "line 1\nline 2\n");
  await call("git_add", { cwd: repo, paths: ["app.txt"] });
  await call("git_commit", { cwd: repo, message: "feat: initial commit" });

  check("log содержит коммит", (await call("git_log", { cwd: repo, format: "oneline" })).includes("feat: initial commit"));
  check("show показывает diff", (await call("git_show", { cwd: repo })).includes("app.txt"));

  console.log("\n# diff / commit all / restore");
  appendFileSync(path.join(repo, "app.txt"), "line 3\n");
  check("diff видит изменение", (await call("git_diff", { cwd: repo })).includes("+line 3"));
  await call("git_restore", { cwd: repo, paths: ["app.txt"] });
  check("restore откатил правку", !readFileSync(path.join(repo, "app.txt"), "utf8").includes("line 3"));
  check("diff пуст после restore", (await call("git_diff", { cwd: repo })).toLowerCase().includes("изменений нет"));

  console.log("\n# ветки / merge / tag");
  await call("git_branch", { cwd: repo, action: "create", name: "feature" });
  await call("git_switch", { cwd: repo, branch: "feature" });
  appendFileSync(path.join(repo, "app.txt"), "feature line\n");
  await call("git_commit", { cwd: repo, message: "feat: feature", all: true });
  await call("git_switch", { cwd: repo, branch: "main" });
  await call("git_merge", { cwd: repo, refs: ["feature"], no_ff: true, message: "merge feature" });
  check("merge влил правку", readFileSync(path.join(repo, "app.txt"), "utf8").includes("feature line"));
  check("ветка feature существует", (await call("git_refs", { cwd: repo, scope: "branches" })).includes("feature"));

  await call("git_tag", { cwd: repo, action: "create", name: "v0.1.0", message: "first release" });
  check("тег создан", (await call("git_tag", { cwd: repo, action: "list" })).includes("v0.1.0"));
  check("describe видит тег", (await call("git_describe", { cwd: repo })).includes("v0.1.0"));

  console.log("\n# stash");
  appendFileSync(path.join(repo, "app.txt"), "stashed line\n");
  await call("git_stash", { cwd: repo, action: "push", message: "wip" });
  check("рабочая копия чистая после stash", !readFileSync(path.join(repo, "app.txt"), "utf8").includes("stashed line"));
  check("stash list содержит запись", (await call("git_stash", { cwd: repo, action: "list" })).includes("wip"));
  await call("git_stash", { cwd: repo, action: "pop", index: 0 });
  check("stash pop вернул правку", readFileSync(path.join(repo, "app.txt"), "utf8").includes("stashed line"));

  console.log("\n# worktree");
  await call("git_worktree", { cwd: repo, action: "add", path: worktree, new_branch: "wt-branch", start_point: "main" });
  check("worktree в списке", (await call("git_worktree", { cwd: repo, action: "list" })).replace(/\\/g, "/").includes("wt"));
  check("worktree видит файл", readFileSync(path.join(worktree, "app.txt"), "utf8").includes("line 1"));
  await call("git_worktree", { cwd: repo, action: "remove", path: worktree, confirm: true });

  console.log("\n# remote / push / clone");
  execFileSync("git", ["init", "--bare", bare], { stdio: "ignore" });
  await call("git_remote", { cwd: repo, action: "add", name: "origin", url: bare.replace(/\\/g, "/") });
  check("remote добавлен", (await call("git_remote", { cwd: repo, action: "list" })).includes("origin"));
  await call("git_push", { cwd: repo, remote: "origin", branch: "main", set_upstream: true, tags: true });
  await call("git_clone", { url: bare.replace(/\\/g, "/"), target: clone, branch: "main" });
  check("clone содержит коммиты", (await call("git_log", { cwd: clone, format: "oneline" })).includes("merge feature"));
  check("clone получил тег", (await call("git_tag", { cwd: clone, action: "list" })).includes("v0.1.0"));
  await call("git_fetch", { cwd: clone, all: true, prune: true });

  console.log("\n# защита разрушительных операций");
  const cleanRefused = await call("git_clean", { cwd: repo, dry_run: false }, { expectError: true });
  check("clean без confirm отклонён", cleanRefused.includes("confirm=true"));
  await call("git_reset", { cwd: repo, mode: "hard", confirm: true });
  const statusAfterReset = await call("git_status", { cwd: repo });
  check("reset --hard выполнен", !statusAfterReset.includes("app.txt"), statusAfterReset);

  console.log("\n# конфиг и обслуживание");
  await call("git_config", { cwd: repo, action: "set", key: "test.value", value: "42" });
  check("config сохранил значение", (await call("git_config", { cwd: repo, action: "get", key: "test.value" })).includes("42"));
  check("count-objects работает", (await call("git_maintenance", { cwd: repo, action: "count_objects" })).toLowerCase().includes("count"));
  check("grep находит текст", (await call("git_grep", { cwd: repo, pattern: "line 1" })).includes("app.txt"));

  console.log("\n# границы доступа");
  const outside = await call("git_status", { cwd: path.join(sandbox, "..") }, { expectError: true });
  check("выход за allowed roots запрещён", outside.includes("вне разрешённых"));

  console.log(`\nИтого: ${passed} успешно, ${failed} провалено`);
  if (failed) process.exitCode = 1;
} catch (error) {
  console.error(`\nТест упал: ${error?.message || error}`);
  process.exitCode = 1;
} finally {
  await client.close().catch(() => {});
  try {
    rmSync(sandbox, { recursive: true, force: true });
  } catch {
    console.error(`Не удалось удалить песочницу: ${sandbox}`);
  }
}
