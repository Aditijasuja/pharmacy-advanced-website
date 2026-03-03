import express from 'express';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Sale from '../models/Sale.js';
import Medicine from '../models/Medicine.js';
import Customer from '../models/Customer.js';
import authMiddleware from '../middleware/authMiddleware.js';
import ownerOnly from '../middleware/ownerOnly.js';
import { createLedgerEntry } from '../utils/ledgerService.js';

const router = express.Router();

// ── POST /api/sales ───────────────────────────────────────────
router.post('/', authMiddleware, [
  body('medicines').isArray({ min: 1 }).withMessage('At least one medicine is required'),
  body('paymentMode')
    .isIn(['cash', 'upi', 'card', 'credit'])
    .withMessage('Invalid payment mode'),
  body('paidAmount')
    .optional()
    .isFloat({ min: 0 }).withMessage('Paid amount must be positive'),
  body('customerId')
    .optional()
    .isMongoId().withMessage('Invalid customer ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      medicines,
      discount    = 0,
      paymentMode,
      paidAmount,
      customerId  = null,
      buyerName,
      buyerPhone
    } = req.body;

    // ── Step 1: Validate customer if provided ─────────────────
    if (customerId) {
      const customer = await Customer.findOne({
        _id: customerId,
        store: req.storeId
      });
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }
    }

    // ── Step 2: Validate stock and calculate totalAmount ──────
    let totalAmount   = 0;
    let profitAmount  = 0;
    const processedMedicines = [];

    for (const item of medicines) {
      const medicine = await Medicine.findOne({
        _id: item.medicineId,
        store: req.storeId
      });

      if (!medicine) {
        return res.status(404).json({ error: `Medicine not found: ${item.medicineId}` });
      }

      if (medicine.quantity < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${medicine.name}. Available: ${medicine.quantity}`
        });
      }

      const itemTotal  = item.priceAtSale * item.quantity;
      const itemProfit = (item.priceAtSale - medicine.purchasePrice) * item.quantity;

      totalAmount  += itemTotal;
      profitAmount += itemProfit;

      processedMedicines.push({
        medicineId:    medicine._id,
        name:          medicine.name,
        quantity:      item.quantity,
        priceAtSale:   item.priceAtSale,
        purchasePrice: medicine.purchasePrice
      });
    }

    // Apply discount
    totalAmount = Math.max(0, totalAmount - discount);

    // ── Step 3: Resolve paidAmount ────────────────────────────
    // cash/upi/card = fully paid by default unless overridden
    // credit        = 0 paid by default unless partial given
    let paid;
    if (paidAmount !== undefined) {
      paid = Math.min(paidAmount, totalAmount);
    } else {
      paid = paymentMode === 'credit' ? 0 : totalAmount;
    }

    const due = totalAmount - paid;

    // ── Step 4: Save sale ─────────────────────────────────────
    const sale = new Sale({
      store:       req.storeId,
      medicines:   processedMedicines,
      totalAmount,
      discount,
      paymentMode,
      paidAmount:  paid,
      dueAmount:   due,
      profitAmount,
      customerId,
      buyerName,
      buyerPhone,
      createdBy:   req.userId
    });

    await sale.save(); // pre-save hook sets paymentStatus

    // ── Step 5: Decrease medicine stock ──────────────────────
    for (const item of processedMedicines) {
      await Medicine.findByIdAndUpdate(
        item.medicineId,
        { $inc: { quantity: -item.quantity } }
      );
    }

    // ── Step 6: Ledger entries (only for named customers) ─────
    // Walk-in sales (no customerId) skip ledger — nothing to track
    if (customerId) {
      // Entry 1 — sale: credit = customer now owes us totalAmount
      await createLedgerEntry({
        storeId:         req.storeId,
        partyType:       'customer',
        partyId:         customerId,
        transactionType: 'sale',
        referenceId:     sale._id,
        debit:           0,
        credit:          totalAmount,
        paymentMode:     null,
        note:            `Sale #${sale._id}`,
        createdBy:       req.userId
      });

      // Entry 2 — payment_in: debit = customer paid, reduces what they owe
      if (paid > 0) {
        await createLedgerEntry({
          storeId:         req.storeId,
          partyType:       'customer',
          partyId:         customerId,
          transactionType: 'payment_in',
          referenceId:     sale._id,
          debit:           paid,
          credit:          0,
          paymentMode,
          note:            `Payment for sale #${sale._id}`,
          createdBy:       req.userId
        });
      }
    }

    const populated = await Sale.findById(sale._id)
      .populate('createdBy', 'name email');

    res.status(201).json({ message: 'Sale created successfully', sale: populated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/sales ────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate, paymentStatus, customerId } = req.query;

    const query = { store: req.storeId };

    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (customerId)    query.customerId    = customerId;

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

// ── GET /api/sales/:id ────────────────────────────────────────
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const sale = await Sale.findOne({
      _id: req.params.id,
      store: req.storeId
    }).populate('createdBy', 'name email');

    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    res.json(sale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/sales/daily ──────────────────────────────────────
router.get('/daily', authMiddleware, ownerOnly, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await Sale.aggregate([
      {
        $match: {
          store: new mongoose.Types.ObjectId(req.storeId),
          date:  { $gte: today }
        }
      },
      {
        $group: {
          _id:          null,
          totalRevenue: { $sum: '$totalAmount' },
          totalProfit:  { $sum: '$profitAmount' },
          salesCount:   { $sum: 1 }
        }
      }
    ]);

    res.json(result[0] || { totalRevenue: 0, totalProfit: 0, salesCount: 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/sales/monthly ────────────────────────────────────
router.get('/monthly', authMiddleware, ownerOnly, async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const result = await Sale.aggregate([
      {
        $match: {
          store: new mongoose.Types.ObjectId(req.storeId),
          date:  { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id:          null,
          totalRevenue: { $sum: '$totalAmount' },
          totalProfit:  { $sum: '$profitAmount' },
          salesCount:   { $sum: 1 }
        }
      }
    ]);

    res.json(result[0] || { totalRevenue: 0, totalProfit: 0, salesCount: 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;