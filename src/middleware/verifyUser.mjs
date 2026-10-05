import httpStatus from "http-status";
import jwt from "jsonwebtoken";
import {createUserSchema} from "../schemas/users/userSchema.mjs";
import User from "../models/userModel/User.mjs";

export const verifyUser = async (req, res, next) => {
  if (
    !req.headers ||
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer")
  ) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      status: "error",
      message: "Authorization failed, Token required",
    });
  }

  const token = req.headers.authorization.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        status: "error",
        message: "Authorization failed, Token is invalid",
      });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        status: "error",
        message: "Authorization failed, Invalid User",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Error in verifying user:", error);

    return res.status(httpStatus.UNAUTHORIZED).json({
      status: "error",
      message: "Authorization failed, Invalid or expired token",
    });
  }
};