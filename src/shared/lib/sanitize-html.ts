import DOMPurify from "dompurify";

const CONFIG = {
  USE_PROFILES: { html: true },
  FORBID_TAGS: ["style", "form", "input", "button", "textarea", "select", "option", "base", "meta", "link"],
  FORBID_ATTR: ["formaction", "srcset"],
  ALLOW_DATA_ATTR: false,
};

let hookInstalled = false;

/**
 * Санитайзер HTML писем (DOMPurify).
 * Вызывать только в браузере: emails грузятся клиентски, SSR не затрагивается.
 */
export function sanitizeEmailHtml(html: string): string {
  if (typeof window === "undefined") return "";

  if (!hookInstalled) {
    // Ссылки из письма открываем в новой вкладке и без доступа к opener
    DOMPurify.addHook("afterSanitizeAttributes", (node) => {
      if (node.tagName === "A") {
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noopener noreferrer");
      }
    });
    hookInstalled = true;
  }

  return DOMPurify.sanitize(html, CONFIG);
}
