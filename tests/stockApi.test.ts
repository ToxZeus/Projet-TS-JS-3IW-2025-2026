import { describe, expect, it, vi, afterEach } from "vitest";
import { parseStocksApiResponse } from "../src/models/stockApi";
import { ApiResponseError, fetchStocks, InvalidApiDataError, NetworkError } from "../src/api/stocksApi";
import { buildDashboard, selectComparisonStocks } from "../src/services/stockService";

const validStocksPayload = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    sector: "Technology",
    currentPrice: 182.45,
    currency: "USD",
    history: [
      {
        date: "2026-04-19",
        price: 181.2,
        volume: 1000
      }
    ]
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    sector: "Automotive",
    currentPrice: 245.3,
    currency: "USD",
    history: [
      {
        date: "2026-04-19",
        price: 244.8,
        volume: 2000
      }
    ]
  }
];

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("parseStocksApiResponse", () => {
  it("accepts a valid payload", () => {
    const parsed = parseStocksApiResponse(validStocksPayload);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].symbol).toBe("AAPL");
  });

  it("rejects an invalid payload", () => {
    expect(() =>
      parseStocksApiResponse([
        {
          symbol: "AAPL",
          name: "Apple Inc.",
          sector: "Technology",
          currency: "USD",
          history: []
        }
      ])
    ).toThrow();
  });
});

describe("fetchStocks", () => {
  it("throws ApiResponseError on HTTP failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn()
    }));

    await expect(fetchStocks()).rejects.toBeInstanceOf(ApiResponseError);
  });

  it("throws InvalidApiDataError on invalid payload", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue([{}])
    }));

    await expect(fetchStocks()).rejects.toBeInstanceOf(InvalidApiDataError);
  });

  it("throws NetworkError on fetch rejection", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    await expect(fetchStocks()).rejects.toBeInstanceOf(NetworkError);
  });
});

describe("stockService", () => {
  it("selects two stocks for comparison", () => {
    const comparison = selectComparisonStocks(validStocksPayload, ["TSLA", "AAPL"]);

    expect(comparison.first.symbol).toBe("TSLA");
    expect(comparison.second.symbol).toBe("AAPL");
  });

  it("builds a dashboard with chart series", () => {
    const dashboard = buildDashboard(validStocksPayload, ["AAPL", "TSLA"]);

    expect(dashboard.stocks).toHaveLength(2);
    expect(dashboard.series[0]).toHaveLength(1);
    expect(dashboard.series[1]).toHaveLength(1);
  });
});
