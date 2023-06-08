import { NextFunction } from "express";
import { User } from "../models/user.model";

const SimpleAuthMiddleware = (req: any, res: Response, next: Function) => {
  const token = req.cookies.token;
  console.log("token ", token);
  if (token) {
    User.findOne({ _id: token })
      .select("+password")
      .then((user) => {
        if (user) {
          req.user = user;
        }
        next();
      })
      .catch((err) => {
        next();
      });
  } else {
    next();
  }
};
export { SimpleAuthMiddleware };
