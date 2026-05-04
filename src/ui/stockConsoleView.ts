import type { StockDashboard, StockComparison } from "../services/stockService.js";

// Build a short label for compared stocks.
function formatComparison(comparison: StockComparison): string {
  return `${comparison.first.symbol} vs ${comparison.second.symbol}`;
}

// Show dashboard summary in the terminal.
export function renderStockDashboard(dashboard: StockDashboard): void {
  console.log(`Loaded ${dashboard.stocks.length} stocks from remote API.`);
  console.log(`Comparison: ${formatComparison(dashboard.comparison)}`);
  console.log(
    `- ${dashboard.comparison.first.symbol} | points: ${dashboard.series[0].length} | current: ${dashboard.comparison.first.currentPrice} ${dashboard.comparison.first.currency}`
  );
  console.log(
    `- ${dashboard.comparison.second.symbol} | points: ${dashboard.series[1].length} | current: ${dashboard.comparison.second.currentPrice} ${dashboard.comparison.second.currency}`
  );
}

// Show a clear error message if loading fails.
export function renderFetchError(error: unknown): void {
  if (error instanceof Error) {
    console.error(`Data fetch error: ${error.name} - ${error.message}`);
    return;
  }

  console.error("Data fetch error: unknown error");
}
