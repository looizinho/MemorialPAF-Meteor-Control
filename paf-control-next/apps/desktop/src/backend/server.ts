import { buildApp } from "./app";

const port = Number(process.env.PAF_SERVER_PORT ?? 4317);
const app = await buildApp();

await app.listen({ port, host: "127.0.0.1" });
console.log(`[paf-backend] Running at http://127.0.0.1:${port}`);
