import { fetchStocks } from "./api/stocksApi";
import { renderFetchError, renderStocksSummary } from "./ui/stockConsoleView";

async function main(): Promise<void> {
  try {
    const stocks = await fetchStocks();
    renderStocksSummary(stocks);
  } catch (error) {
    renderFetchError(error);
    process.exitCode = 1;
  }
}

void main();
