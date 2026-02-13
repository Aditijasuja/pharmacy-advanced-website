import express from 'express';
import { body, validationResult } from 'express-validator';
import Contact from '../models/Contact.js';
import authMiddleware from '../middleware/authMiddleware.js';
import ownerOnly from '../middleware/ownerOnly.js';

const router = express.Router();

router.post('/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('message').trim().notEmpty().withMessage('Message is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const contact = new Contact(req.body);
      await contact.save();

      res.status(201).json({
        message: 'Your message has been sent successfully. We will contact you soon.',
        contact
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.get('/', authMiddleware, ownerOnly, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/status', authMiddleware, ownerOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({ message: 'Status updated', contact });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;