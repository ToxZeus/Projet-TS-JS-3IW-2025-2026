import { buildPriceSeries, type PriceSeriesPoint } from "../charts/priceSeries.js";
import { fetchStocks } from "../api/stocksApi.js";
import type { StockApiItem, StocksApiResponse } from "../models/stockApi.js";

export type StockComparison = {
  first: StockApiItem;
  second: StockApiItem;
};

export type StockDashboard = {
  stocks: StocksApiResponse;
  comparison: StockComparison;
  series: [PriceSeriesPoint[], PriceSeriesPoint[]];
};

export function selectComparisonStocks(
  stocks: StocksApiResponse,
  preferredSymbols: readonly string[] = []
): StockComparison {
  if (stocks.length < 2) {
    throw new Error("At least two stocks are required for comparison");
  }

  const normalizedPreferredSymbols = preferredSymbols.map((symbol) => symbol.toUpperCase());
  const preferredStocks = normalizedPreferredSymbols
    .map((symbol) => stocks.find((stock) => stock.symbol.toUpperCase() === symbol))
    .filter((stock): stock is StockApiItem => stock !== undefined);

  const [first, second] = preferredStocks;

  if (first && second && first.symbol !== second.symbol) {
    return { first, second };
  }

  return {
    first: stocks[0],
    second: stocks[1]
  };
}

export function buildDashboard(stocks: StocksApiResponse, preferredSymbols: readonly string[] = []): StockDashboard {
  const comparison = selectComparisonStocks(stocks, preferredSymbols);

  return {
    stocks,
    comparison,
    series: [buildPriceSeries(comparison.first), buildPriceSeries(comparison.second)]
  };
}

export async function loadStockDashboard(preferredSymbols: readonly string[] = []): Promise<StockDashboard> {
  const stocks = await fetchStocks();
  return buildDashboard(stocks, preferredSymbols);
}
