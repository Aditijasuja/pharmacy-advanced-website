const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.originalUrl} →`, err.message);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: Object.values(err.errors).map(e => e.message).join(', ')
    });
  }

  // Mongoose duplicate key (e.g. duplicate email or store)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      error: 'Duplicate entry',
      details: `${field} already exists`
    });
  }

  // Mongoose invalid ObjectId (e.g. /api/medicine/not-an-id)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID',
      details: `${err.path} is not a valid ID`
    });
  }

  // JWT errors (shouldn't reach here normally, caught in authMiddleware)
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired. Please login again.' });
  }

  // Generic fallback
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
};

export default errorHandler;