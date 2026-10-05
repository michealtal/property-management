import express from "express";

import { createApartment, getApartments, getApartmentById, updateApartment, deleteApartment } from "../../controllers/apartment/apartmentController.mjs";

import { createApartmentSchema } from "../../schemas/apartment/apartment.mjs";

import { validationMiddleware } from "../../middleware/validation.mjs";

import { verifyUser } from "../../middleware/verifyUser.mjs";

const router = express.Router();

router.post(
  "/",
  verifyUser,
  validationMiddleware(createApartmentSchema),
  createApartment
);

router.get(
  "/",
  verifyUser,
  getApartments
);

router.get(
  "/:id",
  verifyUser,
  getApartmentById
);

router.patch("/:id", verifyUser, updateApartment);
router.delete("/:id", verifyUser, deleteApartment);

export default router;