import { config } from "dotenv";
config();

import Fastify from "fastify";
import { fastifyCors } from "@fastify/cors";
import axios from "axios";

const env = {
  PROCESSOR_DEFAULT_URL: process.env["PROCESSOR_DEFAULT_URL"]!,
  PROCESSOR_FALLBACK_URL: process.env["PROCESSOR_FALLBACK_URL"]!,
};

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

fastify.get("/payments-summary", async () => {
  console.log(env);

  const [defaultResponse, fallbackResponse] = await Promise.all([
    processorApi.get("/admin/payments-summary"),
    processorFallbackApi.get("/admin/payments-summary"),
  ]);

  return {
    default: defaultResponse.data,
    fallback: fallbackResponse.data,
  };
});

fastify.post("/payments", async () => {
  return { hello: "world" };
});

fastify.listen({ port: 9999, host: "0.0.0.0" });
