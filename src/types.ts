// Define core stock data structures for the local database and api operations.
export type Stock = {
  id: number;
  symbol: string;
  name: string;
  sector: string;
  price: number;
  currency: string;
  marketCap?: number;
  updatedAt: string;
};

export type StockCreateInput = {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  currency: string;
  marketCap?: number;
};

export type StockUpdateInput = Partial<StockCreateInput>;
