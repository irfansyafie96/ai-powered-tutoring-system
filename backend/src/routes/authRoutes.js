import { Router } from "express";
import { signup } from "../controllers/authController.js";
import { login } from "../controllers/authController.js";
import { getProfile } from "../controllers/authController.js";
import { editProfile } from "../controllers/authController.js";
import { authenticateJWT } from "../middleware/authenticateJWT.js";

const authRoutes = Router();
authRoutes.post("/signup", signup);
authRoutes.post("/login", login);
authRoutes.get("/me", authenticateJWT, getProfile);
authRoutes.put("/profile", authenticateJWT, editProfile);

export default authRoutes;
