import express from "express";
import { createStock, deleteStock, findStockById, getStocks, updateStock } from "./service";
import { stockCreateSchema, stockSearchSchema, stockUpdateSchema } from "./validation";
import { ZodError } from "zod";

export function createApp() {
  const app = express();

  app.use(express.json());

  app.get("/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  app.get("/api/stocks", async (request, response, next) => {
    try {
      const filters = stockSearchSchema.parse(request.query);
      const stocks = await getStocks(filters);
      response.json({ data: stocks, count: stocks.length });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/stocks/:id", async (request, response, next) => {
    try {
      const id = Number(request.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        response.status(400).json({ error: "Invalid stock id" });
        return;
      }

      const stock = await findStockById(id);

      if (!stock) {
        response.status(404).json({ error: "Stock not found" });
        return;
      }

      response.json({ data: stock });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/stocks", async (request, response, next) => {
    try {
      const payload = stockCreateSchema.parse(request.body);
      const stock = await createStock(payload);
      response.status(201).json({ data: stock });
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/stocks/:id", async (request, response, next) => {
    try {
      const id = Number(request.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        response.status(400).json({ error: "Invalid stock id" });
        return;
      }

      const payload = stockUpdateSchema.parse(request.body);
      const stock = await updateStock(id, payload);

      if (!stock) {
        response.status(404).json({ error: "Stock not found" });
        return;
      }

      response.json({ data: stock });
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/stocks/:id", async (request, response, next) => {
    try {
      const id = Number(request.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        response.status(400).json({ error: "Invalid stock id" });
        return;
      }

      const deleted = await deleteStock(id);

      if (!deleted) {
        response.status(404).json({ error: "Stock not found" });
        return;
      }

      response.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    if (error instanceof ZodError) {
      response.status(400).json({ error: "Validation error", details: error.message });
      return;
    }

    if (error instanceof Error) {
      response.status(500).json({ error: "Internal server error", details: error.message });
      return;
    }

    response.status(500).json({ error: "Internal server error" });
  });

  return app;
}
