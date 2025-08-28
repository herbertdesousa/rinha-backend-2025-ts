import Fastify from "fastify";

const fastify = Fastify({
  logger: true,
});

fastify.get("/payments-summary", async (request, reply) => {
  return { hello: "world" };
});

fastify.post("/payments", async (request, reply) => {
  return { hello: "world" };
});

fastify.listen({ port: 9999 });
