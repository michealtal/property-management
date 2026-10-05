import Joi from "joi";

export const createUserSchema = Joi.object({
    firstName: Joi.string().min(2).max(50).required(),

    lastName: Joi.string().min(2).max(50).required(),

    email: Joi.string().email().required(),
  
    phone: Joi.string().min(7).max(20).required(),
  
    password: Joi.string().min(8).required(),
    confirmPassword: Joi.any()
  .valid(Joi.ref("password"))
  .required()
  .messages({
    "any.only": "Passwords do not match",
  }),
})

export const loginUserSchema = Joi.object({
    email: Joi.string().email().required(),

    password: Joi.string().min(8).required(),
})

export const updateUserSchema = Joi.object({ 
    firstName: Joi.string().min(2).max(50).optional(),

    lastName: Joi.string().min(2).max(50).optional(),

    phone: Joi.string().min(7).max(20).optional(),

    password: Joi.string().min(8).optional(),
})