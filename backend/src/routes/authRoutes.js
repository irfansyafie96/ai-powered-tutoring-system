import { Router } from "express";
import { signup } from "../controllers/authController.js";
import { login } from "../controllers/authController.js";

const authRoutes = Router();
authRoutes.post("/signup", signup);
authRoutes.post("/login", login);

export default authRoutes;
