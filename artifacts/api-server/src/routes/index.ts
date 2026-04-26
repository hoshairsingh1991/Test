import { Router, type IRouter } from "express";
import healthRouter from "./health";
import tradesRouter from "./trades";
import metricsRouter from "./metrics";
import analysisRouter from "./analysis";
import reviewRouter from "./review";

const router: IRouter = Router();

router.use(healthRouter);
router.use(tradesRouter);
router.use(metricsRouter);
router.use(analysisRouter);
router.use(reviewRouter);

export default router;
