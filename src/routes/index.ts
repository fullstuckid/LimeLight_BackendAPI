import type { Request, Response } from "express";
import { Router } from "express";
import UserRouter from "./user-route";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.sendResponse(200, {
    message: "Welcome to the API",
  });
});

router.get("/docs", (_req: Request, res: Response) => {
  res.redirect("https://documenter.getpostman.com/view/16800568/2s847BVGTv");
});

router.use("/users", UserRouter);

export default router;
