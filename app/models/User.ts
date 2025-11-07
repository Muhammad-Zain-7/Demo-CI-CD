import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  walletAddress: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Create index for better performance (email already has unique index)
userSchema.index({ walletAddress: 1 });

export default mongoose.models.User || mongoose.model('User', userSchema);
