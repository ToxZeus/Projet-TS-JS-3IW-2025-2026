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
