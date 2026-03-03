import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false // never returned in queries unless explicitly asked
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false // becomes true after OTP email verification
  },
  isActive: {
    type: Boolean,
    default: true
  },

  //otp email verification
  otp: {
    code: { type: String, default: null },
    expiresAt: { type: Date, default: null }
  },

  //forgot password
  passwordReset: {
    token: { type: String, default: null },
    expiresAt: { type: Date, default: null }
  }

}, { timestamps: true });


// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare plain password with hashed
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate a 6-digit OTP and set 10-min expiry
userSchema.methods.generateOTP = function () {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = {
    code,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000) 
  };
  return code;
};

// Verify OTP — returns true/false
userSchema.methods.verifyOTP = function (inputCode) {
  if (!this.otp?.code || !this.otp?.expiresAt) return false;
  if (new Date() > this.otp.expiresAt) return false;   // expired
  return this.otp.code === inputCode;
};

// Clear OTP after use
userSchema.methods.clearOTP = function () {
  this.otp = { code: null, expiresAt: null };
};

const User = mongoose.model('User', userSchema);
export default User;