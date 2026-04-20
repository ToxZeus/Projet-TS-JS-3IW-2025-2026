import { StockApiItem } from "../models/stockApi";

export type PriceSeriesPoint = {
  date: string;
  price: number;
};

export function buildPriceSeries(stock: StockApiItem): PriceSeriesPoint[] {
  return stock.history.map((point) => ({
    date: point.date,
    price: point.price
  }));
}
