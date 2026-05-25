const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev (excluding test runs)
  if (process.env.NODE_ENV !== 'test') {
    console.error(err);
  }

  // Mongoose bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new Error(message);
    error.statusCode = 404;
  }

  // Mongoose duplicate key (11000)
  if (err.code === 11000) {
    let message = 'Duplicate field value entered';
    if (err.keyValue && err.keyValue.bookingDate) {
      message = 'You already have a confirmed booking at this date and time slot.';
    } else if (err.keyValue && err.keyValue.email) {
      message = 'Email is already registered';
    }
    error = new Error(message);
    error.statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new Error(message);
    error.statusCode = 400;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
  });
};

module.exports = errorHandler;
