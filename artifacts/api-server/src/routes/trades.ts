import { Router } from "express";

const router = Router();

// Temporary placeholder route
router.get("/trades", (_req: any, res: any) => {
  res.json({
    message: "Trades endpoint working",
    data: []
  });
});

export default router;
