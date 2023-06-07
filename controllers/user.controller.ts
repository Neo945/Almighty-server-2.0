import { Response } from "express";
import IRequest from "../utils/IRequest";
import { IUser, User } from "../models/user.model";

export default {
  getUser: async (req: IRequest, res: Response) => {
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
    if (req.body.password !== req.body.confirmPassword) {
      const data: IUser = req.body;
      const newUser: IUser = await User.create<IUser>(data);
      const returnData: Object = { ...newUser };
      res
        .status(201)
        .json({ success: true, data: { ...returnData, password: null } });
    }
    res.status(400).json({ success: false, message: "Passwords do not match" });
  },
  login: async (req: IRequest, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password)
      res.status(400).json({
        success: false,
        message: "Please provide an email and password",
      });
    const token = await User.login(email, password);
    if (token) {
      res.cookie("token", token, { httpOnly: true });
      res.status(200).json({ success: true, data: token });
    } else
      res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
  },
  logout: (req: IRequest, res: Response) => {
    res.cookie("token", "", { maxAge: 1 });
    res.status(200).json({ success: true, data: {} });
  },
  // forgotPassword: (req: IRequest, res: Response) => {},
  resetPassword: (req: IRequest, res: Response) => {
    const { password, confirmPassword } = req.body;
    if (password !== confirmPassword)
      res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    User.updateOne(
      { _id: req.user?._id },
      { password },
      { runValidators: true }
    )
      .then((user) => {
        res.status(200).json({ success: true, data: user });
      })
      .catch((err) => {
        res.status(400).json({ success: false, message: err.message });
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
};
