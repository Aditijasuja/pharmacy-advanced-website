import mongoose from 'mongoose';

const purchaseMedicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  batchNumber: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  purchasePrice: {
    type: Number,
    required: true,
    min: 0
  },
  expiryDate: {
    type: Date,
    required: true
  }
}, { _id: false });


const purchaseSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
    index: true
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  medicines: {
    type: [purchaseMedicineSchema],
    validate: [(arr) => arr.length > 0, 'At least one medicine is required']
  },
  totalCost: {
    type: Number,
    required: true,
    min: 0
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  dueAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  paymentMode: {
    type: String,
    enum: ['cash', 'upi', 'card', 'bank_transfer', 'cheque', 'credit'],
    default: 'credit'
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'partial', 'unpaid'],
    default: 'unpaid'
  },
  date: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });


//i have remove next function from this
// Auto-calculate dueAmount and paymentStatus before every save
purchaseSchema.pre('save', function (next) {
  this.dueAmount = this.totalCost - this.paidAmount;
  if (this.dueAmount <= 0)        this.paymentStatus = 'paid';
  else if (this.paidAmount > 0)   this.paymentStatus = 'partial';
  else                            this.paymentStatus = 'unpaid';
  
});

purchaseSchema.index({ store: 1, supplierId: 1 });
purchaseSchema.index({ store: 1, date: -1 });

const Purchase = mongoose.model('Purchase', purchaseSchema);
export default Purchase;