import { NextFunction } from "express";
import { User } from "../models/user.model";

export function SimpleAuthMiddleware(
  req: any,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies.token;
  if (token) {
    User.findOne({ _id: token })
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

  next();
}
