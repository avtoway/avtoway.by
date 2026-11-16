/** Оставляет только цифры — единый ключ для поиска клиента по телефону. */
export function normalizePhone(value?: string | null): string {
  return (value ?? "").replace(/\D/g, "");
}
