import Prize from '../models/Prize.js';
import redis from '../lib/redis.js';
import { logger } from '../lib/logger.js';

export async function spinPrize() {
  const prizes = await Prize.find({ active: true, remainingStock: { $gt: 0 } });
  if (prizes.length === 0) throw new Error('No prizes available');

  const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);
  if (totalWeight <= 0) throw new Error('No prizes available');

  let r = Math.random() * totalWeight;
  let selected = prizes[0];
  for (const p of prizes) {
    r -= p.weight;
    if (r <= 0) { selected = p; break; }
  }

  const updated = await Prize.findOneAndUpdate(
    { _id: selected._id, remainingStock: { $gt: 0 } },
    { $inc: { remainingStock: -1 } },
    { new: true }
  );

  if (!updated) return spinPrize();

  await redis.del('prizes:active');

  logger.info('spin', { prizeId: String(updated._id), name: updated.name, tier: updated.tier, demo: false });

  return {
    prizeId: updated._id,
    name: updated.name,
    description: updated.description,
    tier: updated.tier,
    iconKey: updated.iconKey,
    imageUrl: updated.imageUrl || '',
  };
}

// Preview spin — same weighted random but NO stock decrement and NO cache invalidation.
// Used when the player name is a demo/test account.
export async function spinPrizePreview() {
  const prizes = await Prize.find({ active: true, remainingStock: { $gt: 0 } });
  if (prizes.length === 0) throw new Error('No prizes available');

  const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);
  if (totalWeight <= 0) throw new Error('No prizes available');

  let r = Math.random() * totalWeight;
  let selected = prizes[0];
  for (const p of prizes) {
    r -= p.weight;
    if (r <= 0) { selected = p; break; }
  }

  logger.info('spin.preview', { prizeId: String(selected._id), name: selected.name, tier: selected.tier, demo: true });

  return {
    prizeId: selected._id,
    name: selected.name,
    description: selected.description,
    tier: selected.tier,
    iconKey: selected.iconKey,
    imageUrl: selected.imageUrl || '',
  };
}
