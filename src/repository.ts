import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { Stock, StockCreateInput, StockUpdateInput } from "./types";

const dataDirectory = path.join(process.cwd(), "data");
const dataFilePath = path.join(dataDirectory, "stocks.json");

async function ensureDataFile(): Promise<void> {
  await mkdir(dataDirectory, { recursive: true });

  try {
    await readFile(dataFilePath, "utf8");
  } catch {
    const initialStocks: Stock[] = [];
    await writeFile(dataFilePath, JSON.stringify(initialStocks, null, 2), "utf8");
  }
}

async function readStocksFile(): Promise<Stock[]> {
  await ensureDataFile();
  const rawContent = await readFile(dataFilePath, "utf8");
  const parsedContent = JSON.parse(rawContent) as Stock[];
  return Array.isArray(parsedContent) ? parsedContent : [];
}

async function writeStocksFile(stocks: Stock[]): Promise<void> {
  await ensureDataFile();
  await writeFile(dataFilePath, JSON.stringify(stocks, null, 2), "utf8");
}

export async function listStocks(): Promise<Stock[]> {
  return readStocksFile();
}

export async function findStockById(id: number): Promise<Stock | undefined> {
  const stocks = await readStocksFile();
  return stocks.find((stock) => stock.id === id);
}

export async function createStock(input: StockCreateInput): Promise<Stock> {
  const stocks = await readStocksFile();
  const nextId = stocks.length === 0 ? 1 : Math.max(...stocks.map((stock) => stock.id)) + 1;

  const stock: Stock = {
    id: nextId,
    symbol: input.symbol,
    name: input.name,
    sector: input.sector,
    price: input.price,
    currency: input.currency,
    marketCap: input.marketCap,
    updatedAt: new Date().toISOString()
  };

  await writeStocksFile([...stocks, stock]);
  return stock;
}

export async function updateStock(id: number, input: StockUpdateInput): Promise<Stock | undefined> {
  const stocks = await readStocksFile();
  const index = stocks.findIndex((stock) => stock.id === id);

  if (index === -1) {
    return undefined;
  }

  const current = stocks[index];
  const updated: Stock = {
    ...current,
    ...input,
    updatedAt: new Date().toISOString()
  };

  stocks[index] = updated;
  await writeStocksFile(stocks);
  return updated;
}

export async function deleteStock(id: number): Promise<boolean> {
  const stocks = await readStocksFile();
  const nextStocks = stocks.filter((stock) => stock.id !== id);

  if (nextStocks.length === stocks.length) {
    return false;
  }

  await writeStocksFile(nextStocks);
  return true;
}
