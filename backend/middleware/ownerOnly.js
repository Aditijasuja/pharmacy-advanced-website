const ownerOnly = (req, res, next) => {
  if (!req.storeId) {
    return res.status(403).json({ error: 'Access denied. No store linked to this account.' });
  }
  next();
};

export default ownerOnly;
