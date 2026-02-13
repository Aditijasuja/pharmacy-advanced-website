import express from 'express';
import { body, validationResult } from 'express-validator';
import Purchase from '../models/Purchase.js';
import authMiddleware from '../middleware/authMiddleware.js';
import ownerOnly from '../middleware/ownerOnly.js';

const router = express.Router();

router.post('/', authMiddleware, ownerOnly, [
  body('supplierId').notEmpty().withMessage('Supplier is required'),
  body('medicines').isArray({ min: 1 }).withMessage('At least one medicine is required'),
  body('totalCost').isFloat({ min: 0 }).withMessage('Total cost must be positive')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const purchase = new Purchase(req.body);
    await purchase.save();

    const populatedPurchase = await Purchase.findById(purchase._id)
      .populate('supplierId', 'name phone');

    res.status(201).json({
      message: 'Purchase recorded successfully',
      purchase: populatedPurchase
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', authMiddleware, ownerOnly, async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate('supplierId', 'name phone')
      .sort({ date: -1 })
      .limit(100);

    res.json(purchases);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;