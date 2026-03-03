import mongoose from 'mongoose';

// Contact is a platform-level support form submitted by anyone
// (including unregistered users). It does NOT belong to a store.
const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'resolved'],
    default: 'new'
  }

}, { timestamps: true }); // replaces manual createdAt

const Contact = mongoose.model('Contact', contactSchema);
export default Contact;