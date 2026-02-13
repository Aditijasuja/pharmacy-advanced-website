import express from 'express';
import Medicine from '../models/Medicine.js';
import authMiddleware from '../middleware/authMiddleware.js';
import ownerOnly from '../middleware/ownerOnly.js';

const router = express.Router();

console.log('Medicine routes v2 loaded!');
console.log('authMiddleware type:', typeof authMiddleware);
console.log('ownerOnly type:', typeof ownerOnly);

router.get('/', authMiddleware, async (req, res) => {
  try {
    const medicines = await Medicine.find().limit(10);
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authMiddleware, ownerOnly, async (req, res) => {
  console.log('Medicine POST handler called!');
  try {
    const medicine = new Medicine(req.body);
    await medicine.save();
    res.status(201).json({ message: 'Medicine added successfully', medicine });
  } catch (error) {
    console.error('Medicine POST error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
