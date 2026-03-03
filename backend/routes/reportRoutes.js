import express from 'express';
import mongoose from 'mongoose';
import Sale from '../models/Sale.js';
import Medicine from '../models/Medicine.js';
import authMiddleware from '../middleware/authMiddleware.js';
import ownerOnly from '../middleware/ownerOnly.js';

const router = express.Router();

// ── GET /api/reports/profit ───────────────────────────────────
router.get('/profit', authMiddleware, ownerOnly, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchQuery = { store: new mongoose.Types.ObjectId(req.storeId) };

    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchQuery.date.$lte = end;
      }
    }

    const result = await Sale.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalProfit: { $sum: '$profitAmount' },
          totalRevenue: { $sum: '$totalAmount' },
          salesCount: { $sum: 1 }
        }
      }
    ]);

    res.json(result[0] || { totalProfit: 0, totalRevenue: 0, salesCount: 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/reports/top-selling ──────────────────────────────
router.get('/top-selling', authMiddleware, ownerOnly, async (req, res) => {
  try {
    const result = await Sale.aggregate([
      { $match: { store: new mongoose.Types.ObjectId(req.storeId) } },
      { $unwind: '$medicines' },
      {
        $group: {
          _id: '$medicines.medicineId',
          name: { $first: '$medicines.name' },
          totalQuantity: { $sum: '$medicines.quantity' },
          totalRevenue: {
            $sum: { $multiply: ['$medicines.quantity', '$medicines.priceAtSale'] }
          }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 }
    ]);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/reports/monthly-summary ─────────────────────────
router.get('/monthly-summary', authMiddleware, ownerOnly, async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const result = await Sale.aggregate([
      {
        $match: {
          store: new mongoose.Types.ObjectId(req.storeId),
          date: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          totalRevenue: { $sum: '$totalAmount' },
          totalProfit: { $sum: '$profitAmount' },
          salesCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;