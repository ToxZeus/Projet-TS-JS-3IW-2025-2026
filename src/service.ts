import { createStock, deleteStock, findStockById, listStocks, updateStock } from "./repository";
import { StockCreateInput, StockUpdateInput } from "./types";

// Filter stocks in memory using query options.
export async function getStocks(filters: {
  q?: string;
  sector?: string;
  minPrice?: number;
  maxPrice?: number;
}): Promise<Awaited<ReturnType<typeof listStocks>>> {
  const stocks = await listStocks();

  return stocks.filter((stock) => {
    const matchesQuery = !filters.q || `${stock.symbol} ${stock.name}`.toLowerCase().includes(filters.q.toLowerCase());
    const matchesSector = !filters.sector || stock.sector.toLowerCase() === filters.sector.toLowerCase();
    const matchesMinPrice = filters.minPrice === undefined || stock.price >= filters.minPrice;
    const matchesMaxPrice = filters.maxPrice === undefined || stock.price <= filters.maxPrice;

    return matchesQuery && matchesSector && matchesMinPrice && matchesMaxPrice;
  });
}

// Re-export repository functions for the API routes.
export { createStock, deleteStock, findStockById, updateStock };

// Alias for updateStock.
export async function replaceStock(id: number, input: StockUpdateInput): Promise<ReturnType<typeof updateStock>> {
  return updateStock(id, input);
}

// Alias for createStock.
export async function addStock(input: StockCreateInput) {
  return createStock(input);
}
