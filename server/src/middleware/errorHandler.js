export const errorHandler = (err, req, res, next) => {
  console.error('Server error stack:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong on the server';

  // Hide stack trace in production
  const response = {
    error: message
  };

  if (process.env.NODE_ENV !== 'production' && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
