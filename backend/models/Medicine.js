import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
    index: true  // every query filters by store — index makes it fast
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  batchNumber: {
    type: String,
    required: true,
    trim: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  purchasePrice: {
    type: Number,
    required: true,
    min: 0
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: 0
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  lowStockThreshold: {
    type: Number,
    default: 10,
    min: 0
  }

  // createdAt and updatedAt are handled automatically by
  // { timestamps: true } below — no need to define them manually

}, { timestamps: true });


// ── Indexes ───────────────────────────────────────────────────
// Fast search by store + name (used in medicine search/autocomplete)
medicineSchema.index({ store: 1, name: 1 });

// Fast expiry tracking queries (dashboard alerts)
medicineSchema.index({ store: 1, expiryDate: 1 });

// Fast low-stock queries
medicineSchema.index({ store: 1, quantity: 1 });


// ── Virtuals ──────────────────────────────────────────────────
// isLowStock — true when quantity is at or below the threshold
medicineSchema.virtual('isLowStock').get(function () {
  return this.quantity <= this.lowStockThreshold;
});

// isExpired — true if expiry date has already passed
medicineSchema.virtual('isExpired').get(function () {
  return new Date() > this.expiryDate;
});

// isExpiringSoon — true if expiry is within the next 90 days
medicineSchema.virtual('isExpiringSoon').get(function () {
  const ninetyDays = 90 * 24 * 60 * 60 * 1000;
  return !this.isExpired && (this.expiryDate - new Date()) <= ninetyDays;
});


const Medicine = mongoose.model('Medicine', medicineSchema);
export default Medicine;