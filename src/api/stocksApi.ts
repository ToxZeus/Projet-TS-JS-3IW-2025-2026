import { config } from "../config.js";
import { parseStocksApiResponse, StocksApiResponse } from "../models/stockApi.js";

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

export class ApiResponseError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "ApiResponseError";
  }
}

export class InvalidApiDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidApiDataError";
  }
}

export async function fetchStocks(): Promise<StocksApiResponse> {
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), config.requestTimeoutMs);

  try {
    const response = await fetch(config.stocksApiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json"
      },
      signal: abortController.signal
    });

    if (!response.ok) {
      throw new ApiResponseError(response.status, `API request failed with status ${response.status}`);
    }

    const payload: unknown = await response.json();

    try {
      return parseStocksApiResponse(payload);
    } catch (error) {
      const details = error instanceof Error ? error.message : "Unknown validation error";
      throw new InvalidApiDataError(`API returned invalid payload: ${details}`);
    }
  } catch (error) {
    if (error instanceof ApiResponseError || error instanceof InvalidApiDataError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new NetworkError(`Request timeout after ${config.requestTimeoutMs}ms`);
    }

    const details = error instanceof Error ? error.message : "Unknown network error";
    throw new NetworkError(`Network request failed: ${details}`);
  } finally {
    clearTimeout(timeoutId);
  }
}
