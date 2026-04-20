import { renderFetchError, renderStockDashboard } from "./ui/stockConsoleView";
import { loadStockDashboard } from "./services/stockService";

async function main(): Promise<void> {
  try {
    const dashboard = await loadStockDashboard(["AAPL", "TSLA"]);
    renderStockDashboard(dashboard);
  } catch (error) {
    renderFetchError(error);
    process.exitCode = 1;
  }
}

void main();
