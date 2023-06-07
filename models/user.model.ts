import { Model, Schema, model } from "mongoose";
import isEmail from "validator/lib/isEmail";
import isStrongPassword from "validator/lib/isStrongPassword";
import bcrypt from "bcrypt";

interface IUser {
  _id: string;
  name: Object | string;
  email: Object | string;
  password: Object | string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserModel extends Model<IUser> {
  login: (email: string, password: string) => Promise<string | null>;
  matchPassword: (password: string) => Promise<boolean>;
}

const UserSchema = new Schema<IUser, UserModel>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      validate: [isEmail, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      validate: [
        isStrongPassword,
        "Password must contain at least 1 lowercase, 1 uppercase, 1 number, and 1 special character",
      ],
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  const salt: string | Buffer = await bcrypt.genSalt(10);
  const hash: string = await bcrypt.hash(this.password as string, salt);
  this.set("password", hash);
  next();
});

UserSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.statics.login = async function (email: string, password: string) {
  const user = await this.findOne({ email }).select("+password");
  if (user) {
    const isMatch = await bcrypt.compare(user.password as string, password);
    if (isMatch) return user._id;
  }
  return null;
};

const User = model<IUser, UserModel>("User", UserSchema);
export { User, IUser };
