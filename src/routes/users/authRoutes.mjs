import express from "express";
import { registerUser, loginUser , getUsers, getUserById, updateUser, deleteUser, uploadProfilePicture} from "../../controllers/users/authController.mjs";
import { createUserSchema, loginUserSchema, updateUserSchema } from "../../schemas/users/userSchema.mjs";
import { validationMiddleware } from "../../middleware/validation.mjs";
import { verifyUser } from "../../middleware/verifyUser.mjs";
import upload from "../../middleware/upload.mjs";

const router = express.Router();

router.post(
  "/register",
  validationMiddleware(createUserSchema),
  registerUser
);

router.post(
    "/login",
    validationMiddleware(loginUserSchema),
    loginUser
  );

router.get("/", getUsers);

router.get("/:id", verifyUser, getUserById);

router.patch(
  "/profile-picture",
  verifyUser,
  upload.single("profilePicture"),
  uploadProfilePicture
);

router.patch("/:id", verifyUser, validationMiddleware(updateUserSchema), updateUser);

router.delete("/:id", verifyUser, deleteUser);


export default router;