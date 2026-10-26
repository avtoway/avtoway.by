import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const serverPath = fileURLToPath(new URL("../server.mjs", import.meta.url));
const env = Object.fromEntries(
  Object.entries(process.env).filter(([, value]) => typeof value === "string"),
);

const transport = new StdioClientTransport({
  command: process.execPath,
  args: [serverPath],
  env,
  stderr: "inherit",
});

const client = new Client({ name: "imagegen-smoke", version: "1.0.0" });
await client.connect(transport);

let failed = false;
const check = (name, ok, details = "") => {
  console.log(`${ok ? "OK  " : "FAIL"} ${name}${details ? ` — ${details}` : ""}`);
  if (!ok) failed = true;
};

try {
  const { tools } = await client.listTools();
  const names = tools.map((tool) => tool.name).sort();
  const expected = [
    "check_setup",
    "edit_image",
    "generate_image",
    "list_generated",
    "list_models",
    "recommend_model",
  ];
  check("tools/list", expected.every((name) => names.includes(name)), names.join(", "));

  const generate = tools.find((tool) => tool.name === "generate_image");
  check(
    "generate_image schema",
    Boolean(generate?.inputSchema?.properties?.prompt && generate?.inputSchema?.properties?.model),
  );

  const catalog = await client.callTool({ name: "list_models", arguments: {} });
  const catalogText = catalog.content?.[0]?.text ?? "";
  check("list_models", catalogText.includes("flux-1.1-pro") && catalogText.includes("ideogram-3"));

  const filtered = await client.callTool({
    name: "list_models",
    arguments: { filter: "текст", format: "markdown" },
  });
  check("list_models filter", String(filtered.content?.[0]?.text ?? "").includes("ideogram-3"));

  const recommendation = await client.callTool({
    name: "recommend_model",
    arguments: { use_case: "фото автомобиля для страницы аренды", priority: "quality", limit: 3 },
  });
  const recText = recommendation.content?.[0]?.text ?? "";
  check("recommend_model", recText.includes("flux-1.1-pro"), recText.split("\n")[2] ?? "");

  const setup = await client.callTool({ name: "check_setup", arguments: {} });
  const setupText = setup.content?.[0]?.text ?? "";
  check("check_setup", setupText.includes("Папка результатов") && setupText.includes("FAL_KEY"));

  const generated = await client.callTool({ name: "list_generated", arguments: { limit: 3 } });
  check("list_generated", Boolean(generated.content?.[0]?.text));

  const missingKey = await client.callTool({
    name: "generate_image",
    arguments: {
      model: "flux-1.1-pro",
      prompt: "smoke test image",
      count: 1,
      preview: false,
    },
  });
  const errorText = String(missingKey.content?.[0]?.text ?? "");
  const graceful = missingKey.isError
    ? errorText.includes("FAL_KEY") || errorText.includes("ключ")
    : true;
  check("generate_image без ключа даёт понятную ошибку", graceful, missingKey.isError ? "isError=true" : "ключ есть, пропущено");
} finally {
  await client.close();
}

console.log(failed ? "\nЕсть ошибки." : "\nВсе проверки пройдены.");
process.exit(failed ? 1 : 0);
