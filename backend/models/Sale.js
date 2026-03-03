import mongoose from 'mongoose';
//add customerId: {
//   type: mongoose.Schema.Types.ObjectId,
//   ref: 'Customer',
//   default: null
// }
const saleMedicineSchema = new mongoose.Schema({
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true
  },
  name: { type: String },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  priceAtSale: {
    type: Number,
    required: true
  },
  purchasePrice: {
    type: Number,
    default: 0
  }
}, { _id: false });


const saleSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
    index: true
  },
  medicines: {
    type: [saleMedicineSchema],
    validate: [(arr) => arr.length > 0, 'At least one medicine is required']
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  paymentMode: {
    type: String,
    enum: ['cash', 'upi', 'card', 'credit'],
    required: true
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
  paymentStatus: {
    type: String,
    enum: ['paid', 'partial', 'unpaid'],
    default: 'paid'
  },
  buyerName: {
    type: String,
    trim: true
  },
  buyerPhone: {
    type: String,
    trim: true
  },
  profitAmount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });


// Auto-calculate dueAmount and paymentStatus before save
saleSchema.pre('save', function (next) {
  // If paidAmount not explicitly set, treat full payment for cash/upi/card
  if (this.paymentMode !== 'credit' && this.paidAmount === 0) {
    this.paidAmount = this.totalAmount;
  }
  this.dueAmount = this.totalAmount - this.paidAmount;
  if (this.dueAmount <= 0)       this.paymentStatus = 'paid';
  else if (this.paidAmount > 0)  this.paymentStatus = 'partial';
  else                           this.paymentStatus = 'unpaid';
  next();
});


saleSchema.index({ store: 1, date: -1 });
saleSchema.index({ store: 1, createdBy: 1 });

const Sale = mongoose.model('Sale', saleSchema);
export default Sale;