import Joi from "joi";

export const createApartmentSchema = Joi.object({
  apartmentNumber: Joi.string().required(),

  address: Joi.string().required(),

  type: Joi.string().required(),

  status: Joi.string()
    .valid("vacant", "occupied")
    .optional(),
});

export const updateApartmentSchema = Joi.object({
  apartmentNumber: Joi.string().optional(),

  address: Joi.string().optional(),

  type: Joi.string().optional(),

  status: Joi.string()
    .valid("vacant", "occupied")
    .optional(),
});