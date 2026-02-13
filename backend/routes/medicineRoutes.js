import express from 'express';
import Medicine from '../models/Medicine.js';
import authMiddleware from '../middleware/authMiddleware.js';
import ownerOnly from '../middleware/ownerOnly.js';

const router = express.Router();

console.log('Medicine routes loaded!');

router.get('/test', (req, res) => {
  res.json({ message: 'Test route works!' });
});

router.post('/test', (req, res) => {
  res.json({ message: 'Test POST works!', data: req.body });
});

router.post('/', authMiddleware, ownerOnly, async (req, res) => {
  try {
    const medicine = new Medicine(req.body);
    await medicine.save();

    const populatedMedicine = await Medicine.findById(medicine._id)
      .populate('supplierId', 'name phone');

    res.status(201).json({
      message: 'Medicine added successfully',
      medicine: populatedMedicine
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

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

router.get('/low-stock', authMiddleware, async (req, res) => {
  try {
    const lowStock = await Medicine.find({
      $expr: { $lte: ['$quantity', '$lowStockThreshold'] }
    }).populate('supplierId', 'name phone');

    res.json(lowStock);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/expiry-alert', authMiddleware, async (req, res) => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringMedicines = await Medicine.find({
      expiryDate: { $lte: thirtyDaysFromNow, $gte: new Date() }
    }).populate('supplierId', 'name phone');

    res.json(expiringMedicines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authMiddleware, ownerOnly, async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
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

router.delete('/:id', authMiddleware, ownerOnly, async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);

    if (!medicine) {
      return res.status(404).json({ error: 'Medicine not found' });
    }

    res.json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
