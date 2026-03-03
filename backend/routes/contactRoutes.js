import express from 'express';
import { body, validationResult } from 'express-validator';
import Contact from '../models/Contact.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// ── POST /api/contact ─────────────────────────────────────────
// Public — no auth needed, anyone can submit a support message
router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone is required')
    .isLength({ min: 10, max: 10 }).withMessage('Phone must be 10 digits')
    .isNumeric().withMessage('Phone must contain only numbers'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('email').optional().isEmail().withMessage('Invalid email address')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const contact = new Contact(req.body);
    await contact.save();

    res.status(201).json({
      message: 'Your message has been sent successfully. We will contact you soon.'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/contact ──────────────────────────────────────────
// Protected — only logged-in owners can view submissions
router.get('/', authMiddleware, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── PATCH /api/contact/:id/status ────────────────────────────
router.patch('/:id/status', authMiddleware, [
  body('status')
    .isIn(['new', 'contacted', 'resolved'])
    .withMessage('Status must be new, contacted, or resolved')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
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