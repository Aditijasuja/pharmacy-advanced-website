import mongoose from "mongoose";

const saleSchema = new mongoose.Schema({
  medicines: [
    {
      medicineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Medicine",
        required: true,
      },
      name: String,
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      priceAtSale: {
        type: Number,
        required: true,
      },
      purchasePrice: Number,
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
  },
  paymentMode: {
    type: String,
    enum: ["cash", "upi", "card"],
    required: true,
  },
   buyerName: {
    type: String,
    trim: true,
  },

  buyerPhone: {
    type: String,
    trim: true,
  },
  profitAmount: {
    type: Number,
    default: 0,
  },
 
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Sale = mongoose.model("Sale", saleSchema);
export default Sale;
