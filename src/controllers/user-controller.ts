import { createHmac, randomBytes } from "crypto";
import type { Request, Response } from "express";
import base64url from "base64-url";
import { UserModel } from "../models";
import { AppError, sendEmail } from "../utils";
import { Tokenin } from "../lib";

export type UserRegisterRequestType = {
  name: string
  email: string
  password: string
  photo?: string
}

// RegExp pattern for fields validation
const pattern = {
  name: /^([\w\d\s])+$/,
  email: /^[\w\d]+((\.?.{1,2}))+@[\w\d]+((\.?).{1,2})+\w{2,}$/,
  password: /^(?=.*[A-Z]{1,})(?=.*[a-z]{1,})(?=.*[0-9]{1,})(?=.*[@#$%&]{1,})(?=.{8,25})/,
};

/**
 * User Registration Function
 */
export const register = async (req: Request<unknown, unknown, UserRegisterRequestType>, res: Response) => {
  const {
    name, email, password, photo,
  } = req.body;

  if (!name || !email || !password) {
    return res.sendError(400, "Missing required fields");
  }

  if (!pattern.name.test(name)) {
    return res.sendError(400, "Names can only contain letters, numbers and spaces");
  }

  if (!pattern.email.test(email)) {
    return res.sendError(400, "Invalid email");
  }

  if (!pattern.password.test(password)) {
    return res.sendError(400, "Password must contain 1 uppercase letter, 1 number, 1 special character, and a minimum of 8 characters");
  }

  try {
    // Check if user is in database or not
    const check = await UserModel.findUserByEmail(email);

    if (check) {
      throw new AppError(409, "User already registered");
    }

    // Create new user and save it to database
    const newUser = new UserModel({
      user: {
        username: `${name.split(" ")[0]?.toLowerCase() ?? name.toLowerCase()}-${randomBytes(6).toString("hex")}`,
        name,
        email,
        password,
        photo,
      },
    });
    const savedUser = await newUser.save();

    if (!savedUser) {
      throw new AppError(500, "Error when saving user, please try again");
    }

    // Send verification link to user email
    const verify = await sendEmail({
      templateName: "verification-email",
      to: email,
      subject: "Verify your email",
      data: {
        name,
        link: `${process.env.BASE_URL || "http://localhost:8080"}/api/v1/users/verify?activation_token=${base64url.encode(Tokenin.sign({
          email,
          _id: savedUser._id,
        }))}&email=${base64url.encode(email)}`,
      },
    });

    if (!verify) {
      await savedUser.remove();
      throw new AppError(500, "Error when sending verification email, please try again");
    }

    return res.sendResponse(200, {
      message: "Registration successful! please verify your account by clicking the link sent to your email",
    });
  } catch (error: any) {
    return res.sendError(error?.statusCode ?? 500, error?.message ?? "Internal server erorr");
  }
};

/**
 * User verify function
 */
export const verify = async (
  req: Request<unknown, unknown, unknown, { activation_token: string, email: string }>,
  res: Response,
) => {
  const { activation_token, email } = req.query;

  if (!activation_token || !email) {
    return res.sendError(400, "Missing required fields");
  }

  const decodeToken = base64url.decode(activation_token);
  const decodedEmail = base64url.decode(email);

  if (!decodeToken || !decodedEmail) {
    return res.sendError(400, !decodeToken ? "Invalid activation token" : "Invalid email");
  }

  try {
    // decrypt decoded token
    const data: { _id: string, email: string } | null = Tokenin.verify(decodeToken);

    if (!data) {
      throw new AppError(400, "Invalid activation token");
    }

    if (data.email !== decodedEmail) {
      throw new AppError(400, "Email is not the same");
    }

    // Check user
    const user = await UserModel.findOne({
      _id: data._id,
      email: data.email,
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    if (user.is_verified) {
      throw new AppError(400, "User already verified");
    }

    // Update user
    const updatedUser = await UserModel.findOneAndUpdate({
      _id: data._id,
      "user.email": data.email,
    }, {
      $set: {
        is_verified: true,
        updated_at: new Date().toISOString(),
      },
    });

    if (!updatedUser) {
      throw new AppError(500, "Error when updating user");
    }

    return res.sendResponse(200, {
      message: "Your account has been verified!",
    });
  } catch (error: any) {
    return res.sendError(error?.statusCode ?? 500, error?.message ?? "Internal server erorr");
  }
};

/**
 * User login function
 */
export const login = async (req: Request<unknown, unknown, Pick<UserRegisterRequestType, "email" | "password">>, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.sendError(400, "Missing required fields");
  }

  if (!pattern.email.test(email)) {
    return res.sendError(400, "Invalid email");
  }

  if (!pattern.password.test(password)) {
    return res.sendError(400, "Invalid password");
  }

  try {
    // Check user
    const user = await UserModel.findUserByEmail(email);

    if (!user) {
      throw new AppError(404, "User not found");
    }

    if (!user.is_verified) {
      throw new AppError(401, "Please verify your email by clicking the link sent to your email");
    }

    // Check user password
    const hashedPassword = createHmac("sha512", email).update(password).digest("hex");

    if (user.user.password !== hashedPassword) {
      throw new AppError(400, "Password does not match");
    }

    // Generate access token
    const accessToken = Tokenin.sign({
      id: user._id,
      email,
    }, process.env.SESSION_SECRET_KEY as string);

    return res.sendResponse<{ access_token: string }>(200, {
      message: "Login successfully!",
      data: {
        access_token: accessToken,
      },
    });
  } catch (error: any) {
    return res.sendError(error?.statusCode ?? 500, error?.message ?? "Internal server erorr");
  }
};
