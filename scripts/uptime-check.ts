const url = (process.env.HEALTH_URL ?? "http://localhost:3000/api/health").replace(/\/$/, "");

async function main() {
  const startedAt = Date.now();
  const response = await fetch(url, { cache: "no-store" });
  const json = await response.json().catch(() => null);
  console.log(JSON.stringify({ url, status: response.status, latencyMs: Date.now() - startedAt, health: json }, null, 2));
  if (!response.ok || !json?.ok) process.exitCode = 1;
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
