import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);

export const stockCreateSchema = z.object({
  symbol: nonEmptyString.max(12).transform((value) => value.toUpperCase()),
  name: nonEmptyString.max(120),
  sector: nonEmptyString.max(80),
  price: z.number().finite().nonnegative(),
  currency: nonEmptyString.length(3).transform((value) => value.toUpperCase()),
  marketCap: z.number().finite().nonnegative().optional()
});

export const stockUpdateSchema = stockCreateSchema.partial().extend({
  symbol: nonEmptyString.max(12).transform((value) => value.toUpperCase()).optional(),
  currency: nonEmptyString.length(3).transform((value) => value.toUpperCase()).optional()
});

export const stockSearchSchema = z.object({
  q: z.string().trim().min(1).max(80).optional(),
  sector: z.string().trim().min(1).max(80).optional(),
  minPrice: z.coerce.number().finite().nonnegative().optional(),
  maxPrice: z.coerce.number().finite().nonnegative().optional()
});
