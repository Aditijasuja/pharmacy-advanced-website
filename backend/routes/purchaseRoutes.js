import express from 'express';
import { body, validationResult } from 'express-validator';
import Purchase from '../models/Purchase.js';
import Medicine from '../models/Medicine.js';
import authMiddleware from '../middleware/authMiddleware.js';
import ownerOnly from '../middleware/ownerOnly.js';
import { createLedgerEntry } from '../utils/ledgerService.js';

const router = express.Router();

// ── POST /api/purchase ────────────────────────────────────────
router.post('/', authMiddleware, ownerOnly, [
  body('supplierId').notEmpty().withMessage('Supplier is required'),
  body('medicines').isArray({ min: 1 }).withMessage('At least one medicine is required'),
  body('paidAmount').optional().isFloat({ min: 0 }).withMessage('Paid amount must be positive'),
  body('paymentMode')
    .optional()
    .isIn(['cash', 'upi', 'card', 'bank', 'credit'])
    .withMessage('Invalid payment mode')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { supplierId, medicines, paidAmount = 0, paymentMode = 'credit', date, notes } = req.body;

    // ── Step 1: Calculate totalCost ───────────────────────────
    let totalCost = 0;

    for (const item of medicines) {
      if (!item.quantity || !item.purchasePrice) {
        return res.status(400).json({ error: 'Each medicine must have quantity and purchasePrice' });
      }
      totalCost += item.quantity * item.purchasePrice;
    }

    const paid = Math.min(paidAmount, totalCost);
    const due  = totalCost - paid;

    // ── Step 2: Save purchase ─────────────────────────────────
    const purchase = new Purchase({
      store: req.storeId,
      supplierId,
      medicines,
      totalCost,
      paidAmount: paid,
      dueAmount:  due,
      paymentMode,
      date:  date || Date.now(),
      notes
    });

    await purchase.save(); // pre-save hook sets paymentStatus

    // ── Step 3: Increase medicine stock ───────────────────────
    for (const item of medicines) {
      await Medicine.findOneAndUpdate(
        { _id: item.medicineId || item._id, store: req.storeId },
        { $inc: { quantity: item.quantity } }
      );
    }

    // ── Step 4: Ledger — purchase entry ───────────────────────
    // credit = supplier balance increases = we owe them totalCost
    await createLedgerEntry({
      storeId:         req.storeId,
      partyType:       'supplier',
      partyId:         supplierId,
      transactionType: 'purchase',
      referenceId:     purchase._id,
      debit:           0,
      credit:          totalCost,
      paymentMode:     null,
      note:            `Purchase #${purchase._id}`,
      createdBy:       req.userId
    });

    // ── Step 5: Ledger — payment_out entry (only if paid now) ─
    // debit = supplier balance decreases = we paid them
    if (paid > 0) {
      await createLedgerEntry({
        storeId:         req.storeId,
        partyType:       'supplier',
        partyId:         supplierId,
        transactionType: 'payment_out',
        referenceId:     purchase._id,
        debit:           paid,
        credit:          0,
        paymentMode,
        note:            `Payment for purchase #${purchase._id}`,
        createdBy:       req.userId
      });
    }

    const populated = await Purchase.findById(purchase._id)
      .populate('supplierId', 'name phone');

    res.status(201).json({ message: 'Purchase recorded successfully', purchase: populated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/purchase ─────────────────────────────────────────
router.get('/', authMiddleware, ownerOnly, async (req, res) => {
  try {
    const { supplierId, paymentStatus, startDate, endDate } = req.query;

    const query = { store: req.storeId };

    if (supplierId)    query.supplierId    = supplierId;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate)   query.date.$lte = new Date(endDate);
    }

    const purchases = await Purchase.find(query)
      .populate('supplierId', 'name phone')
      .sort({ date: -1 })
      .limit(100);

    res.json(purchases);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/purchase/:id ─────────────────────────────────────
router.get('/:id', authMiddleware, ownerOnly, async (req, res) => {
  try {
    const purchase = await Purchase.findOne({
      _id: req.params.id,
      store: req.storeId
    }).populate('supplierId', 'name phone address');

    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    res.json(purchase);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── PUT /api/purchase/:id ─────────────────────────────────────
// Mark a due purchase as paid — creates payment_out ledger entry
router.put('/:id', authMiddleware, ownerOnly, async (req, res) => {
  try {
    const purchase = await Purchase.findOne({
      _id: req.params.id,
      store: req.storeId
    });

    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    const { paidAmount, paymentMode } = req.body;

    if (paidAmount !== undefined) {
      // Only create ledger entry for the newly added payment amount
      const additionalPayment = paidAmount - purchase.paidAmount;

      purchase.paidAmount  = paidAmount;
      purchase.paymentMode = paymentMode || purchase.paymentMode;
      await purchase.save(); // pre-save hook recalculates dueAmount + paymentStatus

      if (additionalPayment > 0) {
        await createLedgerEntry({
          storeId:         req.storeId,
          partyType:       'supplier',
          partyId:         purchase.supplierId,
          transactionType: 'payment_out',
          referenceId:     purchase._id,
          debit:           additionalPayment,
          credit:          0,
          paymentMode:     paymentMode || purchase.paymentMode,
          note:            `Payment update for purchase #${purchase._id}`,
          createdBy:       req.userId
        });
      }
    }

    const populated = await Purchase.findById(purchase._id)
      .populate('supplierId', 'name phone');

    res.json({ message: 'Purchase updated successfully', purchase: populated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;