import { describe, it, expect } from "vitest";
import { sanitizeEmailHtml } from "@/shared/lib/sanitize-html";

describe("sanitizeEmailHtml", () => {
  it("вырезает скрипты и обработчики событий", () => {
    const result = sanitizeEmailHtml(
      '<p onclick="alert(1)">Привет</p><script>alert(1)</script><img src="x" onerror="alert(1)">',
    );

    expect(result).toContain("Привет");
    expect(result).not.toContain("<script");
    expect(result).not.toContain("onerror");
    expect(result).not.toContain("onclick");
  });

  it("вырезает формы, iframe и javascript:-ссылки", () => {
    const result = sanitizeEmailHtml(
      '<form action="/steal"><input name="x"></form><iframe src="https://evil.example"></iframe>' +
        '<a href="javascript:alert(1)">bad</a>',
    );

    expect(result).not.toContain("<form");
    expect(result).not.toContain("<input");
    expect(result).not.toContain("<iframe");
    expect(result).not.toContain("javascript:");
  });

  it("оставляет безопасную разметку и стили", () => {
    const result = sanitizeEmailHtml(
      '<div style="color:#333"><b>Жирный</b><br><a href="https://avtoway.by">Сайт</a></div>',
    );

    expect(result).toContain("<b>Жирный</b>");
    expect(result).toContain('href="https://avtoway.by"');
    expect(result).toContain("color:#333");
  });

  it("добавляет rel/target внешним ссылкам", () => {
    const result = sanitizeEmailHtml('<a href="https://example.com">link</a>');
    expect(result).toContain('rel="noopener noreferrer"');
    expect(result).toContain('target="_blank"');
  });
});
