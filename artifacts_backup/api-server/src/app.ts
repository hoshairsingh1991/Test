import express from "express";
import cors from "cors";
// @ts-ignore
const pinoHttp = require("pino-http");

const app = express();

app.use(pinoHttp());
app.use(cors());
app.use(express.json());

app.get("/healthz", (_req: any, res: any) => {
  res.json({ status: "ok" });
});

// 👇 THIS is the key for Vercel
export default app;
