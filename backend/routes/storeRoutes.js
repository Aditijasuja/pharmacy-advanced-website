import express from 'express';
import { body, validationResult } from 'express-validator';
import Store from '../models/Store.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// ── GET /api/store ────────────────────────────────────────────
// Returns the store profile for the logged-in owner
router.get('/', authMiddleware, async (req, res) => {
  try {
    const store = await Store.findById(req.storeId);

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    res.json(store);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── PUT /api/store ────────────────────────────────────────────
// Update store profile — owner can update name, address, GST etc.
router.put('/', authMiddleware, [
  body('name').optional().trim().notEmpty().withMessage('Store name cannot be empty'),
  body('phone')
    .optional()
    .isLength({ min: 10, max: 10 }).withMessage('Phone must be 10 digits')
    .isNumeric().withMessage('Phone must contain only numbers'),
  body('gstNumber').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, address, gstNumber, logo, invoicePrefix } = req.body;

    // findOneAndUpdate with store owner check — extra safety
    const store = await Store.findOneAndUpdate(
      { _id: req.storeId, owner: req.userId },
      { name, phone, address, gstNumber, logo, invoicePrefix },
      { new: true, runValidators: true }
    );

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    res.json({ message: 'Store updated successfully', store });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;