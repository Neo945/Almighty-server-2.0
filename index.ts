import express from "express";
import { Request, Response } from "express";
import { Error, connect } from "mongoose";
import cookieParser from "cookie-parser";
import router from "./router";
import morgan from "morgan";
// import { SimpleAuthMiddleware } from "./middlewares/SimpleAuth";
import dotenv from "dotenv";
import JWTAuth from "./middlewares/JWTAuth";
import session from "express-session";
dotenv.config();

const app: express.Application = express();
app.use(cookieParser());
const { PORT = 3000, MONGO_URI = "mongodb://localhost:27017/almighty" } =
  process.env;

app.use(
  morgan("[:date[iso]] Started :method :url for :remote-addr", {
    immediate: true,
  })
);

app.use(
  morgan(
    "[:date[iso]] Completed :status :res[content-length] in :response-time ms"
  )
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/static", express.static("public"));

app.use(
  session({
    secret: process.env.SECRET_KEY as string,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 3,
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: false,
    },
  })
);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

// app.use("/api", JWTAuth as any, router);
app.use("/api", router);

connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  })
  .catch((err: Error) => {
    console.log(err.message);
  });
