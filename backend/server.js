import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';


import authRoutes from './routes/authRoutes.js';
import medicineRoutes from './routes/medicineRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import salesRoutes from './routes/salesRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import contactRoutes from './routes/contactRoutes.js';

import storeRoutes from './routes/storeRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import ledgerRoutes from './routes/ledgerRoutes.js';

import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGINS || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


mongoose.connect(process.env.MONGO_URL, {
  dbName: process.env.DB_NAME,
  serverSelectionTimeoutMS: 5000
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));


app.get('/api', (req, res) => {
  res.json({ message: 'Pharmacy SaaS API' });
});


app.use('/api/auth', authRoutes);           // login, signup, OTP, forgot password
app.use('/api/store', storeRoutes);         // store profile
app.use('/api/customers', customerRoutes);  // customer CRUD
app.use('/api/ledger', ledgerRoutes);       // ledger, payments, statements


app.use('/api/medicine', medicineRoutes);
app.use('/api/supplier', supplierRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/purchase', purchaseRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/contact', contactRoutes);


app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;