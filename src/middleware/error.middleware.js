const createError = require("http-errors");
const { getFailuerResponse } = require("../utils/response.util");

exports.errorHandler = (err, req, res, next) => {
  const { status = 500 } = err;
  const errorMessage = err.message || "Something went wrong.";
  res.status(status).json(getFailuerResponse(status, errorMessage));
};

exports.notFoundHandler = (req, res, next) => {
  return next(createError(404, "Resource Not Found!"));
};
