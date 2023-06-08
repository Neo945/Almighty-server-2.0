import { Router } from "express";
import UserController from "../controllers/user.controller";

const router = Router();

router.get("/", UserController.getUser);
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/logout", UserController.logout);
router.post("/reset", UserController.resetPassword);
router.get("/delete", UserController.deleteUser);

export default router;
