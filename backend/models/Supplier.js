import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
    index: true
  },
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
  address: {
    type: String,
    required: true,
    trim: true
  },
  gstNumber: {
    type: String,
    trim: true
  }

}, { timestamps: true }); // replaces manual createdAt


// Fast lookup by store + name (used in dropdowns/search)
supplierSchema.index({ store: 1, name: 1 });

const Supplier = mongoose.model('Supplier', supplierSchema);
export default Supplier;