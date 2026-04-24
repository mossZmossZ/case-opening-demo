import mongoose from 'mongoose';

const appSettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'global' },
  maximumAttempts: { type: Number, required: true, min: 1, max: 5, default: 5 },
  updatedAt: { type: Date, default: Date.now },
});

appSettingsSchema.pre('save', function updateTimestamp(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('AppSettings', appSettingsSchema);
