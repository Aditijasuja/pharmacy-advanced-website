import express from 'express';
import { body, validationResult } from 'express-validator';
import Supplier from '../models/Supplier.js';
import authMiddleware from '../middleware/authMiddleware.js';
import ownerOnly from '../middleware/ownerOnly.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/',
  authMiddleware,
  ownerOnly,
  [
    body('name').trim().notEmpty().withMessage('Supplier name is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('address').trim().notEmpty().withMessage('Address is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const supplier = new Supplier(req.body);
      await supplier.save();

      res.status(201).json({
        message: 'Supplier added successfully',
        supplier
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;