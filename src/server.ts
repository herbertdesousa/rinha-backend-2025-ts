import Fastify from "fastify";
import { fastifyCors } from "@fastify/cors";

const fastify = Fastify({ logger: true });
fastify.register(fastifyCors, { origin: "*" });

fastify.get("/payments-summary", async () => {
  return { hello: "world" };
});

fastify.post("/payments", async () => {
  return { hello: "world" };
});

fastify.listen({ port: 9999, host: "0.0.0.0" });
