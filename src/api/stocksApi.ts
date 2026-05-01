import { config } from "../config.js";
import { parseStocksApiResponse, StocksApiResponse } from "../models/stockApi.js";

// Error used when network fails or request times out.
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

// Error used when the API returns a non-2xx status.
export class ApiResponseError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "ApiResponseError";
  }
}

// Error used when API data does not match our schema.
export class InvalidApiDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidApiDataError";
  }
}

// Fetch stocks with timeout, status checks, and data validation.
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
      // Validate the JSON response before using it.
      return parseStocksApiResponse(payload);
    } catch (error) {
      const details = error instanceof Error ? error.message : "Unknown validation error";
      throw new InvalidApiDataError(`API returned invalid payload: ${details}`);
    }
  } catch (error) {
    // Re-throw known API/data errors as they are.
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
