import { Response } from "express";
import IRequest from "./IRequest";
import { Error } from "mongoose";

export default async function ErrorHandler(
  req: any,
  res: Response,
  cb: Function
) {
  try {
    await cb();
  } catch (err: any) {
    console.log("err ", err);
    res.status(403).json({ message: err.message });
  }
}
