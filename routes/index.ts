import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.sendResponse(200, {
    message: "Welcome to the API",
  });
});

export default router;
