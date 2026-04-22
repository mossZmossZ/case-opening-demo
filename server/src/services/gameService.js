import Prize from '../models/Prize.js';

/**
 * Server-side weighted random prize selection.
 * Only considers active prizes with remaining stock > 0.
 * Atomically decrements stock to prevent overselling.
 */
export async function spinPrize() {
  const prizes = await Prize.find({ active: true, remainingStock: { $gt: 0 } });
  if (prizes.length === 0) throw new Error('No prizes available');

  const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);
  if (totalWeight <= 0) throw new Error('No prizes available');

  let r = Math.random() * totalWeight;
  let selected = prizes[0];
  for (const p of prizes) {
    r -= p.weight;
    if (r <= 0) {
      selected = p;
      break;
    }
  }

  // Atomically decrement stock — prevents race conditions
  const updated = await Prize.findOneAndUpdate(
    { _id: selected._id, remainingStock: { $gt: 0 } },
    { $inc: { remainingStock: -1 } },
    { new: true }
  );

  // If stock was depleted between selection and update, retry once
  if (!updated) {
    return spinPrize();
  }

  return {
    prizeId: updated._id,
    name: updated.name,
    description: updated.description,
    tier: updated.tier,
    iconKey: updated.iconKey,
    imageUrl: updated.imageUrl || '',
  };
}
