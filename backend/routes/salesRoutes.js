import express from 'express';
import { body, validationResult } from 'express-validator';
import Sale from '../models/Sale.js';
import Medicine from '../models/Medicine.js';
import authMiddleware from '../middleware/authMiddleware.js';
import ownerOnly from '../middleware/ownerOnly.js';

const router = express.Router();

router.post('/',
  authMiddleware,
  [
    body('medicines').isArray({ min: 1 }).withMessage('At least one medicine is required'),
    body('totalAmount').isFloat({ min: 0 }).withMessage('Total amount must be positive'),
    body('paymentMode').isIn(['cash', 'upi', 'card']).withMessage('Invalid payment mode')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { medicines, totalAmount, discount, paymentMode } = req.body;

      let profitAmount = 0;
      const medicinesWithProfit = [];

      for (const item of medicines) {
        const medicine = await Medicine.findById(item.medicineId);

        if (!medicine) {
          return res.status(404).json({ error: `Medicine not found: ${item.medicineId}` });
        }

        if (medicine.quantity < item.quantity) {
          return res.status(400).json({ 
            error: `Insufficient stock for ${medicine.name}. Available: ${medicine.quantity}` 
          });
        }

        medicine.quantity -= item.quantity;
        await medicine.save();

        const profit = (item.priceAtSale - medicine.purchasePrice) * item.quantity;
        profitAmount += profit;

        medicinesWithProfit.push({
          medicineId: medicine._id,
          name: medicine.name,
          quantity: item.quantity,
          priceAtSale: item.priceAtSale,
          purchasePrice: medicine.purchasePrice
        });
      }

      const sale = new Sale({
        medicines: medicinesWithProfit,
        totalAmount,
        discount: discount || 0,
        paymentMode,
        profitAmount,
        createdBy: req.user._id
      });

      await sale.save();

      const populatedSale = await Sale.findById(sale._id)
        .populate('createdBy', 'name email');

      res.status(201).json({
        message: 'Sale created successfully',
        sale: populatedSale
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};

    if (req.user.role === 'staff') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query.date = { $gte: today };
      query.createdBy = req.user._id;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const sales = await Sale.find(query)
      .populate('createdBy', 'name email')
      .sort({ date: -1 })
      .limit(100);

    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/daily', authMiddleware, ownerOnly, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailySales = await Sale.aggregate([
      {
        $match: {
          date: { $gte: today }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalProfit: { $sum: '$profitAmount' },
          salesCount: { $sum: 1 }
        }
      }
    ]);

    res.json(dailySales[0] || { totalRevenue: 0, totalProfit: 0, salesCount: 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/monthly', authMiddleware, ownerOnly, async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlySales = await Sale.aggregate([
      {
        $match: {
          date: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalProfit: { $sum: '$profitAmount' },
          salesCount: { $sum: 1 }
        }
      }
    ]);

    res.json(monthlySales[0] || { totalRevenue: 0, totalProfit: 0, salesCount: 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;