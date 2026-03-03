import express from 'express';
import { body, validationResult } from 'express-validator';
import Supplier from '../models/Supplier.js';
import authMiddleware from '../middleware/authMiddleware.js';
import ownerOnly from '../middleware/ownerOnly.js';

const router = express.Router();

// ── GET /api/supplier ─────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const suppliers = await Supplier.find({ store: req.storeId })
      .sort({ createdAt: -1 });

    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/supplier/:id ─────────────────────────────────────
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const supplier = await Supplier.findOne({
      _id: req.params.id,
      store: req.storeId
    });

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── POST /api/supplier ────────────────────────────────────────
router.post('/', authMiddleware, ownerOnly, [
  body('name').trim().notEmpty().withMessage('Supplier name is required'),
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone is required')
    .isLength({ min: 10, max: 10 }).withMessage('Phone number must be 10 digits')
    .isNumeric().withMessage('Phone must contain only numbers'),
  body('address').trim().notEmpty().withMessage('Address is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // store injected from token — never trusted from req.body
    const supplier = new Supplier({ ...req.body, store: req.storeId });
    await supplier.save();

    res.status(201).json({ message: 'Supplier added successfully', supplier });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── PUT /api/supplier/:id ─────────────────────────────────────
router.put('/:id', authMiddleware, ownerOnly, async (req, res) => {
  try {
    const { name, phone, address, gstNumber } = req.body;

    const supplier = await Supplier.findOneAndUpdate(
      { _id: req.params.id, store: req.storeId },
      { name, phone, address, gstNumber },
      { new: true, runValidators: true }
    );

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.json({ message: 'Supplier updated successfully', supplier });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── DELETE /api/supplier/:id ──────────────────────────────────
router.delete('/:id', authMiddleware, ownerOnly, async (req, res) => {
  try {
    const supplier = await Supplier.findOneAndDelete({
      _id: req.params.id,
      store: req.storeId
    });

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;