import { Response } from "express";
import IRequest from "../utils/IRequest";
import { IUser, User } from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";

export default {
  getUser: async (req: IRequest, res: Response) => {
    console.log("req.user ", req.user);
    if (req.user) res.status(200).json({ success: true, data: req.user });
    else
      res
        .status(404)
        .json({ success: false, message: "User not found or Logged In" });
  },
  getUsers: async (req: IRequest, res: Response) => {
    const ids = req.query.ids as Array<string>;
    const users = await User.find<Array<IUser>>({ _id: { $in: ids } });
    res.status(200).json({ success: true, data: users });
  },
  register: async (req: IRequest, res: Response) => {
    ErrorHandler(req, res, async () => {
      if (req.body.password === req.body.confirmPassword) {
        const data: IUser = req.body;
        const newUser: IUser = await User.create<IUser>(data);
        const returnData: Object = { ...newUser };
        return res
          .status(201)
          .json({ success: true, data: { ...returnData, password: null } });
      }
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    });
  },
  login: async (req: IRequest, res: Response) => {
    const { email, password } = req.body;
    // console.log("email ", email);
    // console.log("password ", password);
    // return res.status(200).json({ success: true, data: {} });
    if (!email || !password)
      return res.status(400).json({
        success: false,
        message: "Please provide an email and password",
      });
    const token = await User.login(email, password);
    if (token) {
      res.cookie("token", token, { httpOnly: true });
      return res.status(200).json({ success: true, data: token });
    } else
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
  },
  logout: (req: IRequest, res: Response) => {
    res.cookie("token", "", { maxAge: 1 });
    res.status(200).json({ success: true, data: {} });
  },
  resetPassword: async (req: IRequest, res: Response) => {
    const { currentPassword, password, confirmPassword } = req.body;
    const match = await User.matchPassword(
      currentPassword,
      req.user?.password as string
    );
    if (req.user && match) {
      if (password !== confirmPassword)
        return res
          .status(400)
          .json({ success: false, message: "Passwords do not match" });
      User.updateOne(
        { _id: req.user?._id },
        { password },
        { runValidators: true }
      )
        .then((user) => {
          return res.status(200).json({ success: true, data: user });
        })
        .catch((err) => {
          return res.status(400).json({ success: false, message: err.message });
        });
    } else
      return res.status(400).json({
        success: false,
        message: "Invalid current password or not logged in",
      });
  },
  // updateDetails: (req: IRequest, res: Response) => {},
  deleteUser: (req: IRequest, res: Response) => {
    const { _id } = req.user!;
    User.deleteOne({ _id })
      .then((user) => {
        res.status(200).json({ success: true, data: user });
      })
      .catch((err) => {
        res.status(400).json({ success: false, message: err.message });
      });
  },
  updateDetails: (req: IRequest, res: Response) => {
    const { _id } = req.user!;
    const { name, email } = req.body;
    User.updateOne({ _id }, { name, email }, { runValidators: true })
      .then((user) => {
        return res.status(200).json({ success: true, data: user });
      })
      .catch((err) => {
        return res.status(400).json({ success: false, message: err.message });
      });
  },
};
