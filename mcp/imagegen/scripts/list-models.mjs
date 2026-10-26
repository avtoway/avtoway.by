import { MODELS, formatCatalogMarkdown, formatModelDetails } from "../lib/catalog.mjs";

console.log("\nМодели генерации изображений (imagegen MCP)\n");
console.log(formatCatalogMarkdown(MODELS));
console.log("\nПодробно:\n");
for (const model of MODELS) {
  console.log(formatModelDetails(model));
  console.log("");
}
console.log("С ключом API:", MODELS.filter((model) => model.keyEnv && process.env[model.keyEnv]).length, "· локальных:", MODELS.filter((model) => !model.keyEnv).length, "из", MODELS.length);
console.log("Добавь ключи в mcp/imagegen/.env — см. .env.example\n");
