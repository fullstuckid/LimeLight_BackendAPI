import { Router } from "express";
import * as UserController from "../controllers/user-controller";

const router = Router({
  strict: true,
});

router.get("/verify", UserController.verify);

router.post("/register", UserController.register);
router.post("/login", UserController.login);

export default router;
