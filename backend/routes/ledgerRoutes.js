import express from 'express';
import mongoose from 'mongoose';
import { body, validationResult } from 'express-validator';
import Ledger from '../models/Ledger.js';
import Customer from '../models/Customer.js';
import Supplier from '../models/Supplier.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { createLedgerEntry } from '../utils/ledgerService.js';

const router = express.Router();

router.use(authMiddleware);

// ── 1. POST /api/ledger/payment ───────────────────────────────
// Manual payment in (customer pays us) or payment out (we pay supplier)
router.post('/payment', [
  body('partyType')
    .isIn(['customer', 'supplier']).withMessage('partyType must be customer or supplier'),
  body('partyId')
    .notEmpty().withMessage('partyId is required')
    .isMongoId().withMessage('Invalid partyId'),
  body('amount')
    .isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
  body('paymentMode')
    .isIn(['cash', 'upi', 'card', 'bank']).withMessage('Invalid payment mode')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { partyType, partyId, amount, paymentMode, note } = req.body;

    // Verify party belongs to this store
    const PartyModel = partyType === 'customer' ? Customer : Supplier;
    const party = await PartyModel.findOne({ _id: partyId, store: req.storeId });
    if (!party) {
      return res.status(404).json({ error: `${partyType} not found` });
    }

    // payment_in  = customer paying us  → debit  (reduces their balance / what they owe)
    // payment_out = we paying supplier  → debit  (reduces supplier balance / what we owe)
    const transactionType = partyType === 'customer' ? 'payment_in' : 'payment_out';

    const entry = await createLedgerEntry({
      storeId:         req.storeId,
      partyType,
      partyId,
      transactionType,
      debit:           amount,
      credit:          0,
      paymentMode,
      note:            note || `Manual payment — ${party.name}`,
      createdBy:       req.userId
    });

    res.status(201).json({
      message: 'Payment recorded successfully',
      entry,
      currentBalance: entry.balanceAfter
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── 2. GET /api/ledger/statement/:partyType/:partyId ──────────
// Full ledger statement with opening balance + running entries
// Query: startDate, endDate
router.get('/statement/:partyType/:partyId', async (req, res) => {
  try {
    const { partyType, partyId } = req.params;
    const { startDate, endDate } = req.query;

    if (!['customer', 'supplier'].includes(partyType)) {
      return res.status(400).json({ error: 'partyType must be customer or supplier' });
    }

    // Verify party belongs to this store
    const PartyModel = partyType === 'customer' ? Customer : Supplier;
    const party = await PartyModel.findOne({
      _id: partyId,
      store: req.storeId
    }).select('name phone address currentBalance');

    if (!party) {
      return res.status(404).json({ error: `${partyType} not found` });
    }

    // ── Opening balance ───────────────────────────────────────
    // = balanceAfter of the last entry BEFORE the startDate
    // If no startDate given, opening balance is always 0
    let openingBalance = 0;

    if (startDate) {
      const lastEntryBeforeRange = await Ledger.findOne({
        store:     req.storeId,
        partyType,
        partyId,
        createdAt: { $lt: new Date(startDate) }
      })
        .sort({ createdAt: -1 })
        .select('balanceAfter');

      openingBalance = lastEntryBeforeRange?.balanceAfter || 0;
    }

    // ── Entries within range ──────────────────────────────────
    const filter = {
      store: req.storeId,
      partyType,
      partyId
    };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const entries = await Ledger.find(filter)
      .sort({ createdAt: 1 })
      .populate('createdBy', 'name');

    // ── Totals for the period ─────────────────────────────────
    const totalDebit  = entries.reduce((sum, e) => sum + e.debit,  0);
    const totalCredit = entries.reduce((sum, e) => sum + e.credit, 0);
    const closingBalance = openingBalance + totalCredit - totalDebit;

    res.json({
      party,
      openingBalance,
      totalDebit,
      totalCredit,
      closingBalance,      // what they owe at end of period
      currentBalance: party.currentBalance, // live balance right now
      entries
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── 3. GET /api/ledger/receivables ────────────────────────────
// Total amount all customers owe this store (currentBalance > 0)
router.get('/receivables', async (req, res) => {
  try {
    const storeObjId = new mongoose.Types.ObjectId(req.storeId);

    const [result, customers] = await Promise.all([
      Customer.aggregate([
        {
          $match: {
            store:          storeObjId,
            isActive:       true,
            currentBalance: { $gt: 0 }
          }
        },
        {
          $group: {
            _id:             null,
            totalReceivable: { $sum: '$currentBalance' },
            count:           { $sum: 1 }
          }
        }
      ]),
      Customer.find({
        store:          req.storeId,
        isActive:       true,
        currentBalance: { $gt: 0 }
      })
        .select('name phone currentBalance')
        .sort({ currentBalance: -1 })
    ]);

    res.json({
      totalReceivable: result[0]?.totalReceivable || 0,
      count:           result[0]?.count           || 0,
      customers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── 4. GET /api/ledger/payables ───────────────────────────────
// Total amount this store owes to suppliers (currentBalance > 0)
router.get('/payables', async (req, res) => {
  try {
    const storeObjId = new mongoose.Types.ObjectId(req.storeId);

    const [result, suppliers] = await Promise.all([
      Supplier.aggregate([
        {
          $match: {
            store:          storeObjId,
            isActive:       true,
            currentBalance: { $gt: 0 }
          }
        },
        {
          $group: {
            _id:          null,
            totalPayable: { $sum: '$currentBalance' },
            count:        { $sum: 1 }
          }
        }
      ]),
      Supplier.find({
        store:          req.storeId,
        isActive:       true,
        currentBalance: { $gt: 0 }
      })
        .select('name phone currentBalance')
        .sort({ currentBalance: -1 })
    ]);

    res.json({
      totalPayable: result[0]?.totalPayable || 0,
      count:        result[0]?.count        || 0,
      suppliers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── 5. GET /api/ledger/summary ────────────────────────────────
// Dashboard card: receivable vs payable + recent transactions
router.get('/summary', async (req, res) => {
  try {
    const storeObjId = new mongoose.Types.ObjectId(req.storeId);

    const [customerAgg, supplierAgg, recentTransactions] = await Promise.all([

      // Customer balance breakdown
      Customer.aggregate([
        { $match: { store: storeObjId, isActive: true } },
        {
          $group: {
            _id:             null,
            totalReceivable: {
              $sum: { $cond: [{ $gt: ['$currentBalance', 0] }, '$currentBalance', 0] }
            },
            totalAdvance: {
              // customers who overpaid (negative balance)
              $sum: { $cond: [{ $lt: ['$currentBalance', 0] }, '$currentBalance', 0] }
            },
            totalCustomers: { $sum: 1 },
            customersWithDue: {
              $sum: { $cond: [{ $gt: ['$currentBalance', 0] }, 1, 0] }
            }
          }
        }
      ]),

      // Supplier balance breakdown
      Supplier.aggregate([
        { $match: { store: storeObjId, isActive: true } },
        {
          $group: {
            _id:          null,
            totalPayable: {
              $sum: { $cond: [{ $gt: ['$currentBalance', 0] }, '$currentBalance', 0] }
            },
            totalAdvance: {
              // suppliers we overpaid (negative balance)
              $sum: { $cond: [{ $lt: ['$currentBalance', 0] }, '$currentBalance', 0] }
            },
            totalSuppliers: { $sum: 1 },
            suppliersWithDue: {
              $sum: { $cond: [{ $gt: ['$currentBalance', 0] }, 1, 0] }
            }
          }
        }
      ]),

      // Last 10 transactions across all parties for this store
      Ledger.find({ store: req.storeId })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('createdBy', 'name')
        .select('partyType partyId transactionType debit credit balanceAfter paymentMode note createdAt')
    ]);

    const totalReceivable = customerAgg[0]?.totalReceivable || 0;
    const totalPayable    = supplierAgg[0]?.totalPayable    || 0;

    res.json({
      totalReceivable,
      totalPayable,
      netPosition:      totalReceivable - totalPayable, // positive = we are owed more than we owe
      customerAdvance:  Math.abs(customerAgg[0]?.totalAdvance  || 0),
      supplierAdvance:  Math.abs(supplierAgg[0]?.totalAdvance  || 0),
      customersWithDue: customerAgg[0]?.customersWithDue || 0,
      suppliersWithDue: supplierAgg[0]?.suppliersWithDue || 0,
      recentTransactions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;