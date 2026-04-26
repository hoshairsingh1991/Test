import express, { type Express } from "express";
import cors from "cors";
// @ts-ignore
const pinoHttp = require("pino-http");

const app: Express = express();

app.use(pinoHttp());
app.use(cors());
app.use(express.json());

// Simple health route
app.get("/healthz", (_req: any, res: any) => {
  res.json({ status: "ok" });
});

export default app;
