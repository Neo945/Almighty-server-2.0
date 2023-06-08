import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";

export default function (req: any, res: Response, next: NextFunction) {
  const token = req.cookies.token;
  if (token) {
    jwt.verify(
      token,
      process.env.SECRET_KEY as string,
      (err: any, decoded: any) => {
        if (err) {
          req.user = null;
          next();
        } else {
          User.findById(decoded.id)
            .then((user) => {
              req.user = user;
              next();
            })
            .catch((err) => {
              req.user = null;
              next();
            });
        }
      }
    );
  } else {
    req.user = null;
    next();
  }
}
