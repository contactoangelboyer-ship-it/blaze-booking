import { Router, type IRouter } from "express";
import healthRouter from "./health";
import reservationsRouter from "./reservations";
import pricingRouter from "./pricing";

const router: IRouter = Router();

router.use(healthRouter);
router.use(reservationsRouter);
router.use(pricingRouter);

export default router;
