const NBRB_API = "https://api.nbrb.by/exrates/rates/431";
let cached: { rate: number; date: string } | null = null;

export async function getUsdRate(): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  if (cached && cached.date === today) return cached.rate;

  try {
    const res = await fetch(NBRB_API, { next: { revalidate: 3600 } });
    const data = await res.json();
    const rate = data.Cur_OfficialRate;
    cached = { rate, date: today };
    return rate;
  } catch {
    return cached?.rate ?? 3.2;
  }
}
