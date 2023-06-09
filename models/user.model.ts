import { Model, Schema, model } from "mongoose";
import isEmail from "validator/lib/isEmail";
import isStrongPassword from "validator/lib/isStrongPassword";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

interface IUser {
  _id: string;
  name: Object | string;
  email: Object | string;
  password: Object | string;
  createdAt?: Date;
  updatedAt?: Date;
  isVerified?: boolean;
}

interface UserModel extends Model<IUser> {
  login: (email: string, password: string) => Promise<string | null>;
  matchPassword: (
    enteredPassword: string,
    hashedPassword: string
  ) => Promise<boolean>;
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
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function (this: any, next: Function) {
  const salt: string | Buffer = await bcrypt.genSalt();
  const hash: string = await bcrypt.hash(this.password as string, salt);
  this.set("password", hash);
  next();
});

UserSchema.pre("updateOne", async function (next: Function) {
  const data = (this.getUpdate() as any).password;
  if (data) {
    const salt: string | Buffer = await bcrypt.genSalt();
    const hash: string = await bcrypt.hash(data as string, salt);
    this.setUpdate({
      password: hash,
    });
    next();
  } else {
    next();
  }
});

UserSchema.statics.matchPassword = async function (
  enteredPassword: string,
  hashedPassword: string
) {
  return await bcrypt.compare(enteredPassword, hashedPassword);
};

function getToken(id: string) {
  // eslint-disable-next-line global-require
  return jwt.sign({ id }, process.env.SECRET_KEY as string, {
    expiresIn: 3 * 24 * 3600,
  });
}

UserSchema.statics.login = async function (email: string, password: string) {
  const user = await this.findOne({ email }).select("+password");
  if (user) {
    const isMatch = await bcrypt.compare(password, user.password as string);
    // if (isMatch) return getToken(user._id);
    if (isMatch) return user;
  }
  return null;
};

const User = model<IUser, UserModel>("User", UserSchema);
export { User, IUser };
