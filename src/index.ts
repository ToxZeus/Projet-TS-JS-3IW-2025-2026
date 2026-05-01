import { renderFetchError, renderStockDashboard } from "./ui/stockConsoleView.js";
import { loadStockDashboard } from "./services/stockService.js";

// App entrypoint for console mode.
async function main(): Promise<void> {
  try {
    const dashboard = await loadStockDashboard(["AAPL", "TSLA"]);
    renderStockDashboard(dashboard);
  } catch (error) {
    renderFetchError(error);
    process.exitCode = 1;
  }
}

// Run main without waiting at top level.
void main();
