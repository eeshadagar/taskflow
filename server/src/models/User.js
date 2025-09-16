import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

// Remove duplicate index declaration - unique: true in field definition is sufficient
// userSchema.index({ email: 1 }, { unique: true }); // This line causes the duplicate index warning

export const User = mongoose.models.User || mongoose.model('User', userSchema);