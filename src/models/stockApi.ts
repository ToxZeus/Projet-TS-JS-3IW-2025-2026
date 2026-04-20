import { z } from "zod";

export const stockHistoryPointSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  price: z.number().finite(),
  volume: z.number().int().nonnegative()
});

export const stockApiItemSchema = z.object({
  symbol: z.string().trim().min(1),
  name: z.string().trim().min(1),
  sector: z.string().trim().min(1),
  currentPrice: z.number().finite(),
  currency: z.string().trim().min(1),
  history: z.array(stockHistoryPointSchema)
});

export const stocksApiResponseSchema = z.array(stockApiItemSchema);

export type StockHistoryPoint = z.infer<typeof stockHistoryPointSchema>;
export type StockApiItem = z.infer<typeof stockApiItemSchema>;
export type StocksApiResponse = z.infer<typeof stocksApiResponseSchema>;

export function parseStocksApiResponse(payload: unknown): StocksApiResponse {
  return stocksApiResponseSchema.parse(payload);
}
