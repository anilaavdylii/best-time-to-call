export async function loadBaselineRates(): Promise<Record<number, number>> {
  const response = await fetch("/data/allo_hourly_baseline.csv");

  if (!response.ok) {
    throw new Error("Could not load Allo baseline CSV");
  }

  const csv = await response.text();
  const lines = csv.trim().split(/\r?\n/);

  const headers = lines[0].split(",").map((h) => h.trim());

  const hourIndex = headers.indexOf("local_hour_24");
  const rateIndex = headers.indexOf("connect_rate_decimal");

  if (hourIndex === -1 || rateIndex === -1) {
    throw new Error("Required CSV columns are missing");
  }

  const rates: Record<number, number> = {};

  for (const line of lines.slice(1)) {
    const columns = line.split(",");

    const hour = Number(columns[hourIndex]);
    const rate = Number(columns[rateIndex]);

    if (
      Number.isInteger(hour) &&
      Number.isFinite(rate) &&
      rate >= 0 &&
      rate <= 1
    ) {
      rates[hour] = rate;
    }
  }

  return rates;
}
