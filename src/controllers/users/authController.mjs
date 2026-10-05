import bcrypt from "bcrypt";
import mongoose from "mongoose";
import httpStatus from "http-status";
import jwt from "jsonwebtoken";
import User from "../../models/userModel/User.mjs";
import fs from "fs/promises";
import cloudinary from "../../config/cloudinary.mjs";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload.mjs";

export const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
    } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(httpStatus.CONFLICT).json({
        status: "error",
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
    });

    return res.status(httpStatus.CREATED).json({
      status: "success",
      message: "User registered successfully",
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);

    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    // Compare entered password with hashed password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(httpStatus.OK).json({
      status: "success",
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          profilePicture: user.profilePicture,
        },
      },
    });
  } catch (error) {
    console.error("Error logging in user:", error);

    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");

    return res.status(httpStatus.OK).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if the user ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // Make sure the landlord can only access their own profile
    if (req.user.id !== id) {
      return res.status(httpStatus.FORBIDDEN).json({
        success: false,
        message: "You are not authorized to access this profile",
      });
    }

    // Find the user and exclude password
    const user = await User.findById(id).select("-password");

     // Check if user exists
     if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(httpStatus.OK).json({
      success: true,
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if the user ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // Make sure the landlord can only update their own profile
    if (req.user.id !== id) {
      return res.status(httpStatus.FORBIDDEN).json({
        success: false,
        message: "You are not authorized to update this profile",
      });
    }

    // Find the user
    const user = await User.findById(id);

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent protected fields from being updated
    const {
      password,
      _id,
      role,
      createdAt,
      updatedAt,
      ...updateData
    } = req.body;

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    return res.status(httpStatus.OK).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if the user ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // Make sure the landlord can only delete their own account
    if (req.user.id !== id) {
      return res.status(httpStatus.FORBIDDEN).json({
        success: false,
        message: "You are not authorized to delete this account",
      });
    }

    // Find the user
    const user = await User.findById(id);

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete the user
    await User.findByIdAndDelete(id);

    return res.status(httpStatus.OK).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const uploadProfilePicture = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        status: "error",
        message: "User not found",
      });
    }

    if (!req.file) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: "error",
        message: "Please upload a profile picture",
      });
    }

    const oldPublicId = user.profilePicturePublicId;

    const result = await uploadToCloudinary(
      req.file.buffer,
      "property-management/users/profile-pictures",
      "image"
    );

    user.profilePictureUrl = result.secure_url;
    user.profilePicturePublicId = result.public_id;

    await user.save();

    if (oldPublicId) {
      try {
        await cloudinary.uploader.destroy(oldPublicId, {
          resource_type: "image",
        });
      } catch (error) {
        console.error(
          "Could not delete old profile picture:",
          error.message
        );
      }
    }

    return res.status(httpStatus.OK).json({
      status: "success",
      message: "Profile picture uploaded successfully",
      data: {
        profilePictureUrl: user.profilePictureUrl,
        profilePicturePublicId: user.profilePicturePublicId,
      },
    });
  } catch (error) {
    console.error("Cloudinary profile picture error:", error);
    next(error);
  }
};