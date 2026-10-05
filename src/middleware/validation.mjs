
import httpStatus from "http-status";

export const validationMiddleware = (schema, type) => {
  return async (req, res, next) => {
    const validationOptions = {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    };

    try {
      let value;

      if (type === "QUERY") {
        value = await schema.validateAsync(
          req.query,
          validationOptions
        );

        req.validatedQuery = value;
      } else {
        value = await schema.validateAsync(
          req.body,
          validationOptions
        );

        req.body = value;
      }

      next();
    } catch (error) {
      const errors = error.details
        ? error.details.map((detail) => detail.message)
        : [error.message];

      return res.status(httpStatus.BAD_REQUEST).json({
        status: "error",
        message: "Validation error",
        errors,
      });
    }
  };
};
