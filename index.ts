import express from "express";
import { Request, Response } from "express";
import { Error, connect } from "mongoose";
import cookieParser from "cookie-parser";

const app: express.Application = express();
app.use(cookieParser());
const { PORT = 3000, MONGO_URI = "mongodb://localhost:27017/almighty" } =
  process.env;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/static", express.static("public"));

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

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
