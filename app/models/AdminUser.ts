import mongoose from 'mongoose';

const adminUserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  role: {
    type: String,
    enum: ['admin', 'super_admin'],
    default: 'admin'
  }
}, {
  timestamps: true
});

// Create index for better performance (username already has unique index)
adminUserSchema.index({ isActive: 1 });

export default mongoose.models.AdminUser || mongoose.model('AdminUser', adminUserSchema);
