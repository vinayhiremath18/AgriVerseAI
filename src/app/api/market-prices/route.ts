import { NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Yahoo Finance tickers for commodity futures
// ---------------------------------------------------------------------------
const TICKERS = {
  wheat:    "ZW=F",   // USD / bushel  (1 bushel wheat   = 27.22 kg)
  rice:     "ZR=F",   // USD / cwt     (1 cwt             = 45.36 kg)
  cotton:   "CT=F",   // USD cents / lb
  soybean:  "ZS=F",   // USD / bushel  (1 bushel soybean = 27.22 kg)
  sugar:    "SB=F",   // USD cents / lb  → proxy for sugarcane
  usdInr:   "USDINR=X",
};

const FALLBACK_USD_INR = 83.5;
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface YahooResult {
  meta: { regularMarketPrice: number; currency: string };
  timestamp?: number[];
  indicators?: { quote: Array<{ close: (number | null)[] }> };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function fetchYahoo(ticker: string): Promise<YahooResult | null> {
  try {
    const url =
      `https://query1.finance.yahoo.com/v8/finance/chart/` +
      `${encodeURIComponent(ticker)}?range=7d&interval=1d&includePrePost=false`;

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "application/json",
        Referer: "https://finance.yahoo.com/",
      },
      // Cache 5 min in Next.js data cache
      next: { revalidate: 300 },
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json?.chart?.result?.[0] ?? null;
  } catch {
    return null;
  }
}

function closeArray(result: YahooResult | null): number[] {
  const closes = result?.indicators?.quote?.[0]?.close ?? [];
  return closes.filter((c): c is number => c !== null);
}

/** Convert from the commodity's native unit to INR/quintal (or INR/tonne for sugarcane) */
function toINRQuintal(rawPrice: number, ticker: string, usdInr: number): number {
  switch (ticker) {
    case TICKERS.wheat:
    case TICKERS.soybean:
      // USD/bushel → INR/quintal  (1 bushel = 27.22 kg, quintal = 100 kg)
      return Math.round(rawPrice * (100 / 27.22) * usdInr);

    case TICKERS.rice:
      // USD/cwt → INR/quintal  (1 cwt = 45.36 kg)
      return Math.round(rawPrice * (100 / 45.36) * usdInr);

    case TICKERS.cotton:
      // USD-cents/lb → INR/quintal  (1 lb = 0.4536 kg)
      return Math.round((rawPrice / 100) * (100 / 0.4536) * usdInr);

    case TICKERS.sugar:
      // USD-cents/lb → INR/tonne  (1 tonne = 2204.62 lb)
      return Math.round((rawPrice / 100) * 2204.62 * usdInr);

    default:
      return Math.round(rawPrice * usdInr);
  }
}

// ---------------------------------------------------------------------------
// GET handler
// ---------------------------------------------------------------------------
export async function GET() {
  try {
    // Fetch all tickers in parallel
    const [wheat, rice, cotton, soybean, sugar, usdInrData] =
      await Promise.all([
        fetchYahoo(TICKERS.wheat),
        fetchYahoo(TICKERS.rice),
        fetchYahoo(TICKERS.cotton),
        fetchYahoo(TICKERS.soybean),
        fetchYahoo(TICKERS.sugar),
        fetchYahoo(TICKERS.usdInr),
      ]);

    const usdInr =
      usdInrData?.meta?.regularMarketPrice ?? FALLBACK_USD_INR;

    // ── Build live price cards ──────────────────────────────────────────────
    type Trend = "up" | "down";
    interface PriceEntry {
      crop: string;
      unit: string;
      base: number;
      price: number;
      change: number;
      trend: Trend;
      source: string;
    }

    function buildEntry(
      result: YahooResult | null,
      ticker: string,
      cropName: string,
      unit: string,
      fallbackPrice: number
    ): PriceEntry {
      const raw = result?.meta?.regularMarketPrice ?? null;
      const closes = closeArray(result);
      const prevRaw = closes.length >= 2 ? closes[closes.length - 2] : null;

      const price = raw !== null ? toINRQuintal(raw, ticker, usdInr) : fallbackPrice;
      const prev  = prevRaw !== null ? toINRQuintal(prevRaw, ticker, usdInr) : price;
      const change =
        prev > 0 ? parseFloat(((price - prev) / prev) * 100 + "") : 0;

      return {
        crop: cropName,
        unit,
        base: price,
        price,
        change: parseFloat(change.toFixed(2)),
        trend: change >= 0 ? "up" : "down",
        source: raw !== null ? "live" : "fallback",
      };
    }

    // Tomato — no liquid futures; estimate from seasonal base ₹40-65/kg
    const tomatoBase = 42 + Math.round(Math.random() * 23);
    const tomatoChange = parseFloat(((Math.random() - 0.5) * 8).toFixed(2));

    const prices: PriceEntry[] = [
      buildEntry(wheat,   TICKERS.wheat,   "Wheat",     "quintal", 2125),
      buildEntry(rice,    TICKERS.rice,    "Rice",      "quintal", 2450),
      buildEntry(cotton,  TICKERS.cotton,  "Cotton",    "quintal", 6800),
      { crop: "Tomato", unit: "kg", base: tomatoBase, price: tomatoBase,
        change: tomatoChange, trend: tomatoChange >= 0 ? "up" : "down", source: "estimate" },
      buildEntry(soybean, TICKERS.soybean, "Soybean",  "quintal", 4200),
      buildEntry(sugar,   TICKERS.sugar,   "Sugarcane","tonne",   3150),
    ];

    // ── Build 7-day chart data ──────────────────────────────────────────────
    const wheatC  = closeArray(wheat);
    const riceC   = closeArray(rice);
    const cottonC = closeArray(cotton);

    const chartLen = Math.min(
      7,
      Math.max(wheatC.length, riceC.length, cottonC.length, 1)
    );

    const chartData = Array.from({ length: chartLen }, (_, i) => {
      const wi = wheatC.length  - chartLen + i;
      const ri = riceC.length   - chartLen + i;
      const ci = cottonC.length - chartLen + i;
      return {
        day:    DAYS[i % 7],
        wheat:  wi >= 0 && wheatC[wi]  ? toINRQuintal(wheatC[wi],  TICKERS.wheat,  usdInr) : 0,
        rice:   ri >= 0 && riceC[ri]   ? toINRQuintal(riceC[ri],   TICKERS.rice,   usdInr) : 0,
        cotton: ci >= 0 && cottonC[ci] ? toINRQuintal(cottonC[ci], TICKERS.cotton, usdInr) : 0,
      };
    }).filter((d) => d.wheat > 0 || d.rice > 0 || d.cotton > 0);

    // ── AI signals derived from actual price movements ──────────────────────
    const wheatEntry   = prices.find((p) => p.crop === "Wheat")!;
    const riceEntry    = prices.find((p) => p.crop === "Rice")!;
    const cottonEntry  = prices.find((p) => p.crop === "Cotton")!;
    const soybeanEntry = prices.find((p) => p.crop === "Soybean")!;

    const aiPredictions = [
      {
        label: riceEntry.change > 0.5 ? "HIGH DEMAND" : riceEntry.change < -0.5 ? "PRICE DIP" : "STABLE",
        crop: "Rice",
        color: "#00ff66",
        bg: "rgba(0,255,102,0.08)",
        change: riceEntry.change,
      },
      {
        label: Math.abs(cottonEntry.change) > 1.5 ? "PRICE SPIKE ALERT" : "STABLE OUTLOOK",
        crop: "Cotton",
        color: "#ffd700",
        bg: "rgba(255,215,0,0.08)",
        change: cottonEntry.change,
      },
      {
        label: wheatEntry.change > -1 ? "LOW RISK CROP" : "CAUTION",
        crop: "Wheat",
        color: "#00e5ff",
        bg: "rgba(0,229,255,0.08)",
        change: wheatEntry.change,
      },
      {
        label: soybeanEntry.change > 0.3 ? "EXPORT OPPORTUNITY" : "HOLD POSITION",
        crop: "Soybean",
        color: "#a78bfa",
        bg: "rgba(167,139,250,0.08)",
        change: soybeanEntry.change,
      },
    ];

    const recommendations = [
      {
        action: riceEntry.change > 0.5 ? "BUY" : riceEntry.change < -0.5 ? "SELL" : "HOLD",
        crop: "Rice",
        reason:
          riceEntry.change > 0.5
            ? "Price rising — strong demand signal"
            : riceEntry.change < -0.5
            ? "Prices weakening — consider exit"
            : "Market stable — monitor closely",
        color: "#00ff66",
        glow: "rgba(0,255,102,0.35)",
      },
      {
        action: (prices.find((p) => p.crop === "Tomato")?.change ?? 0) < -1 ? "SELL" : "HOLD",
        crop: "Tomato",
        reason:
          (prices.find((p) => p.crop === "Tomato")?.change ?? 0) < -1
            ? "Peak harvest — prices softening"
            : "Steady local demand",
        color: "#ffd700",
        glow: "rgba(255,215,0,0.35)",
      },
      {
        action: wheatEntry.change > 0.3 ? "BUY" : "HOLD",
        crop: "Wheat",
        reason:
          wheatEntry.change > 0.3
            ? "Upward momentum — good entry point"
            : "Stable — watch export policy updates",
        color: "#00e5ff",
        glow: "rgba(0,229,255,0.35)",
      },
    ];

    // ── Market sentiment based on majority price direction ──────────────────
    const upCount = prices.filter((p) => p.trend === "up").length;
    const sentimentBullish = upCount >= prices.length / 2;
    const confidence = 55 + Math.round(
      (Math.abs(upCount - prices.length / 2) / prices.length) * 40
    );

    return NextResponse.json({
      success: true,
      prices,
      chartData,
      aiPredictions,
      recommendations,
      sentiment: {
        status: sentimentBullish ? "BULLISH" : "BEARISH",
        confidence,
      },
      usdInr,
      timestamp: Date.now(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[market-prices]", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
