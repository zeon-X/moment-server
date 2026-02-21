import { ApiError } from "../utils/ApiError.js";

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (err) {
    const message =
      err.issues?.[0]?.message || err.message || "Validation error";
    next(new ApiError(400, message));
  }
};
