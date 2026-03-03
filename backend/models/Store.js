import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true  // one store per owner, enforced at DB level
  },
  address: {
    type: String,
    trim: true
  },
  gstNumber: {
    type: String,
    trim: true,
    uppercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  logo: {
    type: String,   // URL or base64 string
    default: null
  },
  invoicePrefix: {
    type: String,
    default: 'INV',
    trim: true
  },
  invoiceCounter: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });


// Called during sale creation to get the next invoice number atomically.
// Produces strings like INV-000001, INV-000002 etc.
storeSchema.methods.nextInvoiceNumber = async function () {
  this.invoiceCounter += 1;
  await this.save();
  return `${this.invoicePrefix}-${String(this.invoiceCounter).padStart(6, '0')}`;
};


const Store = mongoose.model('Store', storeSchema);
export default Store;