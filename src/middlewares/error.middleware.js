const prismaUnavailableCodes = new Set(["P1001", "P1002", "P1017"]);

export const globalErrorHandler = (err, req, res, next) => {
  console.error(err);

  const isDatabaseUnavailable = prismaUnavailableCodes.has(err.code);
  const statusCode = isDatabaseUnavailable ? 503 : err.statusCode || 500;
  const message = isDatabaseUnavailable
    ? "Database temporarily unavailable"
    : err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
  });
};
