import express from 'express';
import Medicine from '../models/Medicine.js';
import authMiddleware from '../middleware/authMiddleware.js';
import ownerOnly from '../middleware/ownerOnly.js';

const router = express.Router();

// ── GET /api/medicine ─────────────────────────────────────────
// List all medicines for this store, with optional search/filter
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search, category } = req.query;

    // store: req.storeId ensures owner only sees their own medicines
    let query = { store: req.storeId };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { batchNumber: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    const medicines = await Medicine.find(query)
      .populate('supplierId', 'name phone')
      .sort({ createdAt: -1 });

    res.json(medicines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/medicine/low-stock ───────────────────────────────
router.get('/low-stock', authMiddleware, ownerOnly, async (req, res) => {
  try {
    const lowStock = await Medicine.find({
      store: req.storeId,
      $expr: { $lte: ['$quantity', '$lowStockThreshold'] }
    }).populate('supplierId', 'name phone');

    res.json(lowStock);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/medicine/expiry-alert ────────────────────────────
router.get('/expiry-alert', authMiddleware, ownerOnly, async (req, res) => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringMedicines = await Medicine.find({
      store: req.storeId,
      expiryDate: { $lte: thirtyDaysFromNow, $gte: new Date() }
    }).populate('supplierId', 'name phone');

    res.json(expiringMedicines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/medicine/:id ─────────────────────────────────────
// store check here prevents one owner from fetching another store's medicine by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const medicine = await Medicine.findOne({
      _id: req.params.id,
      store: req.storeId
    }).populate('supplierId', 'name phone');

    if (!medicine) {
      return res.status(404).json({ error: 'Medicine not found' });
    }

    res.json(medicine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── POST /api/medicine ────────────────────────────────────────
router.post('/', authMiddleware, ownerOnly, async (req, res) => {
  try {
    // Attach store from token — never trust store from req.body
    const medicine = new Medicine({ ...req.body, store: req.storeId });
    await medicine.save();

    const populated = await Medicine.findById(medicine._id)
      .populate('supplierId', 'name phone');

    res.status(201).json({ message: 'Medicine added successfully', medicine: populated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── PUT /api/medicine/:id ─────────────────────────────────────
router.put('/:id', authMiddleware, ownerOnly, async (req, res) => {
  try {
    // store: req.storeId in filter prevents updating another store's medicine
    const medicine = await Medicine.findOneAndUpdate(
      { _id: req.params.id, store: req.storeId },
      req.body,
      { new: true, runValidators: true }
    ).populate('supplierId', 'name phone');

    if (!medicine) {
      return res.status(404).json({ error: 'Medicine not found' });
    }

    res.json({ message: 'Medicine updated successfully', medicine });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── POST /api/medicine/bulk-delete ───────────────────────────
router.post('/bulk-delete', authMiddleware, ownerOnly, async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids?.length) {
      return res.status(400).json({ error: 'No IDs provided' });
    }

    // store: req.storeId ensures they can only delete their own medicines
    await Medicine.deleteMany({ _id: { $in: ids }, store: req.storeId });

    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── DELETE /api/medicine/:id ──────────────────────────────────
router.delete('/:id', authMiddleware, ownerOnly, async (req, res) => {
  try {
    const medicine = await Medicine.findOneAndDelete({
      _id: req.params.id,
      store: req.storeId
    });

    if (!medicine) {
      return res.status(404).json({ error: 'Medicine not found' });
    }

    res.json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;