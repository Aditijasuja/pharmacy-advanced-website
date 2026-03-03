import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  creditLimit: {
    type: Number,
    default: 0,
    min: [0, 'Credit limit cannot be negative']
  },
  currentBalance: {
    // positive = customer owes us (receivable)
    // negative = we owe customer (advance/overpayment)
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

// Fast lookup by store + name (used in search/autocomplete)
customerSchema.index({ store: 1, name: 1 });

// Fast lookup by store + phone
customerSchema.index({ store: 1, phone: 1 }, { sparse: true });

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;