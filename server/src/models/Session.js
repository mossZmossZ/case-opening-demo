import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  attempt: { type: Number, required: true },
  prizeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prize', required: true },
  prizeName: { type: String, required: true },
  tier: { type: String, enum: ['common', 'rare', 'epic', 'legendary'], required: true },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  playerName: { type: String, required: true },
  totalAttempts: { type: Number, required: true, min: 1, max: 10 },
  results: [resultSchema],
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Session', sessionSchema);
