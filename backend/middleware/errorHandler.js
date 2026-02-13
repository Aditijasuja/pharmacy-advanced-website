const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Validation Error',
      details: err.message 
    });
  }

  if (err.name === 'MongoServerError' && err.code === 11000) {
    return res.status(400).json({ 
      error: 'Duplicate entry',
      details: 'Record already exists' 
    });
  }

  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error' 
  });
};

export default errorHandler;