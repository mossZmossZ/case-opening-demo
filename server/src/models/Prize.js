import mongoose from 'mongoose';

const prizeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  tier: { type: String, enum: ['common', 'rare', 'epic', 'legendary'], required: true },
  weight: { type: Number, required: true, min: 0 },
  totalStock: { type: Number, required: true, min: 0 },
  remainingStock: { type: Number, required: true, min: 0 },
  iconKey: { type: String, required: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Prize', prizeSchema);
