import { Router } from "express";
import userRouter from "./routers/user.router";

const router = Router();

router.get("/", (req, res) => {
  res.send("API name missing");
});

router.use("/user", userRouter);

export default router;
