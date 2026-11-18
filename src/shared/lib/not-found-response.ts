/**
 * HTML-ответ для честного 404 из proxy.
 * Страницы с динамическими сегментами стримятся, поэтому notFound() внутри них
 * отдаёт 200. Проверка существования в proxy позволяет вернуть настоящий 404.
 */
export function notFoundHtml(): string {
  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, follow">
<title>Страница не найдена | АВТОWAY</title>
<style>
  *{box-sizing:border-box}
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
    background:#09090b;color:#fafafa;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;
    padding:24px;text-align:center}
  .glow{position:fixed;inset:0;pointer-events:none;
    background:radial-gradient(ellipse 50% 55% at 50% 0%,rgba(239,68,68,.12),transparent 70%)}
  .card{position:relative;max-width:560px}
  .badge{font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#f87171;font-weight:600}
  h1{font-size:clamp(30px,6vw,48px);margin:14px 0 0;letter-spacing:-.02em}
  p{color:#a1a1aa;line-height:1.65;margin:14px auto 0;max-width:420px}
  .actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:30px}
  a{display:inline-flex;align-items:center;justify-content:center;height:46px;padding:0 26px;
    border-radius:999px;text-decoration:none;font-size:14px;font-weight:600;transition:.2s}
  .primary{background:#ef4444;color:#fff;box-shadow:0 10px 30px rgba(239,68,68,.25)}
  .primary:hover{background:#dc2626}
  .secondary{border:1px solid #3f3f46;background:rgba(255,255,255,.04);color:#d4d4d8}
  .secondary:hover{border-color:#71717a;color:#fff}
  .brand{margin-top:34px;font-size:13px;letter-spacing:.18em;color:#3f3f46;font-weight:700}
  .brand span{color:#ef4444}
</style>
</head>
<body>
  <div class="glow"></div>
  <div class="card">
    <div class="badge">Ошибка 404</div>
    <h1>Страница не найдена</h1>
    <p>Возможно, ссылка устарела или услуга временно скрыта. Попробуйте начать с главной страницы.</p>
    <div class="actions">
      <a class="primary" href="/">На главную</a>
      <a class="secondary" href="/services">Все услуги</a>
    </div>
    <div class="brand">АВТО<span>WAY</span></div>
  </div>
</body>
</html>`;
}
