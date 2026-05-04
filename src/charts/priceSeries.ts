import { StockApiItem } from "../models/stockApi.js";

export type PriceSeriesPoint = {
  date: string;
  price: number;
};

// Convert stock history into simple chart points.
export function buildPriceSeries(stock: StockApiItem): PriceSeriesPoint[] {
  return stock.history.map((point) => ({
    date: point.date,
    price: point.price
  }));
}
