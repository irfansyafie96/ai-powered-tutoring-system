import { Router } from "express";
import { signup } from "../controllers/authController.js";
import { login } from "../controllers/authController.js";

const router = Router();
router.post("/signup", signup);
router.post("/login", login);

export default router;
