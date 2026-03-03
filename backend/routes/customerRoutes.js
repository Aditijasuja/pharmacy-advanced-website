import express from 'express';
import { body, validationResult } from 'express-validator';
import Customer from '../models/Customer.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// ── POST /api/customers ───────────────────────────────────────
router.post('/', authMiddleware, [
  body('name').trim().notEmpty().withMessage('Customer name is required'),
  body('phone')
    .optional()
    .isLength({ min: 10, max: 10 }).withMessage('Phone must be 10 digits')
    .isNumeric().withMessage('Phone must contain only numbers'),
  body('creditLimit')
    .optional()
    .isFloat({ min: 0 }).withMessage('Credit limit must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, address, creditLimit } = req.body;

    const customer = new Customer({
      store: req.storeId,
      name,
      phone,
      address,
      creditLimit
    });

    await customer.save();
    res.status(201).json({ message: 'Customer created successfully', customer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/customers ────────────────────────────────────────
// Query params: search, page, limit
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;

    const filter = { store: req.storeId, isActive: true };

    if (search) {
      filter.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Customer.countDocuments(filter);
    const customers = await Customer.find(filter)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ total, page: Number(page), customers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/customers/:id 
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      store: req.storeId
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── PUT /api/customers/:id 
router.put('/:id', authMiddleware, [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone')
    .optional()
    .isLength({ min: 10, max: 10 }).withMessage('Phone must be 10 digits')
    .isNumeric().withMessage('Phone must contain only numbers'),
  body('creditLimit')
    .optional()
    .isFloat({ min: 0 }).withMessage('Credit limit must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, address, creditLimit } = req.body;

    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, store: req.storeId },
      { name, phone, address, creditLimit },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ message: 'Customer updated successfully', customer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── DELETE /api/customers/:id (soft delete) ───────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, store: req.storeId },
      { isActive: false },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;