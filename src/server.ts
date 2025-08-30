import { config } from "dotenv";
config();

import Fastify from "fastify";
import { fastifyCors } from "@fastify/cors";
import axios from "axios";
import { z } from "zod";
import { Pool } from "pg";
import { v4 } from "uuid";

const env = {
  PROCESSOR_DEFAULT_URL: process.env["PROCESSOR_DEFAULT_URL"]!,
  PROCESSOR_FALLBACK_URL: process.env["PROCESSOR_FALLBACK_URL"]!,
  PG_USERNAME: process.env["PG_USERNAME"]!,
  PG_PASSWORD: process.env["PG_PASSWORD"]!,
  PG_DATABASE: process.env["PG_DATABASE"]!,
  PG_PORT: Number(process.env["PG_PORT"]!),
  PG_HOST: process.env["PG_HOST"]!,
};

const pool = new Pool({
  user: env.PG_USERNAME,
  host: env.PG_HOST,
  database: env.PG_DATABASE,
  password: env.PG_PASSWORD,
  port: env.PG_PORT,
  // max: 20, // max number of clients in the pool
  // idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
  // connectionTimeoutMillis: 2000, // how long to wait for a client to connect
});

const processorApi = axios.create({
  baseURL: env.PROCESSOR_DEFAULT_URL,
  headers: {
    'X-Rinha-Token': '123',
  },
});
const processorFallbackApi = axios.create({
  baseURL: env.PROCESSOR_FALLBACK_URL,
  headers: {
    'X-Rinha-Token': '123',
  },
});

const fastify = Fastify({ logger: true });
fastify.register(fastifyCors, { origin: "*" });

const getPaymentSummaryDto = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
});

fastify.get("/payments-summary", async (req, res) => {
  const dto = getPaymentSummaryDto.safeParse(req.query);

  if (!dto.success) {
    return res.status(400).send({ error: "Invalid payload" });
  }

  const { from, to } = dto.data;

  const result = await pool.query(`
    SELECT processor, COUNT(*) as total_requests, SUM(amount) as total_amount
    FROM payments
    WHERE requested_at >= $1 AND requested_at <= $2
    GROUP BY processor
  `, [from, to]);

  const defaultSummary = result.rows.find(row => row.processor === 'default') ?? { total_requests: 0, total_amount: 0 };
  const fallbackSummary = result.rows.find(row => row.processor === 'fallback') ?? { total_requests: 0, total_amount: 0 };

  return {
    default: {
      total_requests: Number(defaultSummary.total_requests),
      total_amount: Number(defaultSummary.total_amount),
    },
    fallback: {
      total_requests: Number(fallbackSummary.total_requests),
      total_amount: Number(fallbackSummary.total_amount),
    },
  };
});

const createPaymentDto = z.object({
  correlationId: z.uuidv4(),
  amount: z.number().positive(),
});

fastify.post("/payments", async (req, res) => {
  const dto = createPaymentDto.safeParse(req.body);

  if (!dto.success) {
    return res.status(400).send({ error: "Invalid payload" });
  }

  let processor = 'default';
  const requestedAt = new Date();

  try {
    await processorApi.post("/payments", {
      ...dto.data,
      requestedAt,
    });
  } catch (error) {
    try {
      await processorFallbackApi.post("/payments", {
        ...dto.data,
        requestedAt,
      });
      processor = 'fallback';
    } catch (error) {
      return res.status(500).send({ error: "Internal server error" });
    }
  }

  await pool.query(`
    INSERT INTO payments (id, correlation_id, amount, requested_at, processor)
    VALUES ($1, $2, $3, $4, $5)
  `, [v4(), dto.data.correlationId, dto.data.amount, requestedAt, processor]);

  return dto.data;
});

fastify.listen({ port: 9999, host: "0.0.0.0" });
