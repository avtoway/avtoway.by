/**
 * Дымовой тест: поднимает сервер по stdio, проверяет список инструментов
 * и вызывает несколько безопасных read-only методов.
 *
 * Запуск: npm run smoke (из mcp/git)
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const serverPath = path.resolve(here, "..", "server.mjs");
const projectRoot = path.resolve(here, "..", "..", "..");

const transport = new StdioClientTransport({
  command: process.execPath,
  args: [serverPath],
  cwd: projectRoot,
  env: { ...process.env },
  stderr: "inherit",
});

const client = new Client({ name: "git-mcp-smoke", version: "1.0.0" });

function preview(result) {
  const item = result?.content?.find((entry) => entry.type === "text");
  const value = item?.text ?? "(нет текста)";
  return value.length > 600 ? `${value.slice(0, 600)}\n…` : value;
}

try {
  await client.connect(transport);

  const { tools } = await client.listTools();
  console.log(`Инструментов: ${tools.length}`);
  console.log(tools.map((tool) => `  - ${tool.name}`).join("\n"));

  const checks = [
    ["git_status", { format: "short" }],
    ["git_log", { max_count: 3, format: "oneline" }],
    ["git_refs", { scope: "branches" }],
    ["gh_status", {}],
  ];

  for (const [name, args] of checks) {
    console.log(`\n=== ${name} ===`);
    try {
      const result = await client.callTool({ name, arguments: args });
      console.log(preview(result));
      if (result.isError) process.exitCode = 1;
    } catch (error) {
      console.error(`Ошибка вызова ${name}: ${error?.message || error}`);
      process.exitCode = 1;
    }
  }
} finally {
  await client.close().catch(() => {});
}
