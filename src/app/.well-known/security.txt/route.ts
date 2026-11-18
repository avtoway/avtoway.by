import { SITE_URL } from "@/shared/config/site";

/** Стандартный security.txt для исследователей безопасности. */
export async function GET() {
  const content = [
    "Contact: mailto:info@avtoway.by",
    "Preferred-Languages: ru, en",
    `Canonical: ${SITE_URL}/.well-known/security.txt`,
    "Policy: /privacy",
    "Expires: 2027-12-31T23:59:59.000Z",
  ].join("\n");

  return new Response(content, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=86400",
    },
  });
}
