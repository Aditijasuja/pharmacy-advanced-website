import mongoose from 'mongoose';

const ledgerSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  partyType: {
    type: String,
    enum: ['customer', 'supplier'],
    required: true
  },
  partyId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  transactionType: {
    type: String,
    enum: ['sale', 'purchase', 'payment_in', 'payment_out', 'return'],
    required: true
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  debit: {
    type: Number,
    default: 0,
    min: 0
  },
  credit: {
    type: Number,
    default: 0,
    min: 0
  },
  balanceAfter: {
    // Stored at insert time — never calculated on the fly
    type: Number,
    required: true
  },
  paymentMode: {
    type: String,
    enum: ['cash', 'upi', 'card', 'bank', null],
    default: null
  },
  note: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }

}, { timestamps: true });

// Fast ledger statement queries (store + party)
ledgerSchema.index({ store: 1, partyType: 1, partyId: 1, createdAt: -1 });

// Fast date range queries
ledgerSchema.index({ createdAt: -1 });

const Ledger = mongoose.model('Ledger', ledgerSchema);
export default Ledger;