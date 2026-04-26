import { Router } from "express";

const router = Router();

// Only working route
router.get("/healthz", (_req: any, res: any) => {
  res.json({ status: "ok" });
});

export default router;
