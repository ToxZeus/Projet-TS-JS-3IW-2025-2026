import { StockApiItem } from "../models/stockApi";
import { buildPriceSeries } from "../charts/priceSeries";

export function renderStocksSummary(stocks: StockApiItem[]): void {
  console.log(`Loaded ${stocks.length} stocks from remote API.`);

  const preview = stocks.slice(0, 5);
  preview.forEach((stock) => {
    const lastPoint = buildPriceSeries(stock).at(-1);
    console.log(
      `- ${stock.symbol} | ${stock.name} | ${stock.currentPrice} ${stock.currency}` +
        (lastPoint ? ` | latest history: ${lastPoint.date} => ${lastPoint.price}` : "")
    );
  });
}

export function renderFetchError(error: unknown): void {
  if (error instanceof Error) {
    console.error(`Data fetch error: ${error.name} - ${error.message}`);
    return;
  }

  console.error("Data fetch error: unknown error");
}
