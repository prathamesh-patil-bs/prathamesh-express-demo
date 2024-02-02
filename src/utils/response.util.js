exports.getSuccessResponse = (message, data = null) => {
  let response = {
    message,
    status: "success",
  };
  if (data) response.data = data;
  return response;
};

exports.getFailuerResponse = (statusCode, message) => {
  return {
    status: "error",
    error: {
      message,
      statusCode,
    },
  };
};
