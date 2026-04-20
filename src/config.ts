export const config = {
  port: Number(process.env.PORT ?? 3000),
  stocksApiUrl: process.env.STOCKS_API_URL ?? "https://keligmartin.github.io/api/stocks.json",
  requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS ?? 10000)
};
