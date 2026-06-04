import { Router, type IRouter } from "express";
import { PRICING, GRATUITY_PERCENT, AIRPORT_SURCHARGE, calculateFare } from "../lib/pricing";
import { EstimateFareBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/pricing", async (_req, res): Promise<void> => {
  res.json({
    vehicles: PRICING,
    gratuityPercent: GRATUITY_PERCENT,
    airportSurcharge: AIRPORT_SURCHARGE,
  });
});

router.post("/pricing/estimate", async (req, res): Promise<void> => {
  const parsed = EstimateFareBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { vehicleType, serviceType, distanceMiles, hours } = parsed.data;
  const estimate = calculateFare(vehicleType, serviceType, distanceMiles, hours);

  res.json(estimate);
});

export default router;
