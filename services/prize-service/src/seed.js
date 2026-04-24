import mongoose from 'mongoose';
import Prize from './models/Prize.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/zenith_prize';

const PRIZES = [
  { name: 'Better Luck!',  description: 'Keep trying',       tier: 'common',    weight: 55,  totalStock: 9999, remainingStock: 9999, iconKey: 'consolation' },
  { name: 'Sticker Set',   description: 'Exclusive designs',  tier: 'common',    weight: 18,  totalStock: 200,  remainingStock: 200,  iconKey: 'sticker' },
  { name: 'T-Shirt',       description: 'Premium cotton',     tier: 'rare',      weight: 12,  totalStock: 80,   remainingStock: 80,   iconKey: 'tshirt' },
  { name: 'Power Bank',    description: '20,000 mAh',         tier: 'rare',      weight: 7,   totalStock: 40,   remainingStock: 40,   iconKey: 'powerbank' },
  { name: 'Hoodie',        description: 'Limited edition',    tier: 'epic',      weight: 5,   totalStock: 30,   remainingStock: 30,   iconKey: 'hoodie' },
  { name: 'Backpack',      description: 'Tech carry',         tier: 'epic',      weight: 2,   totalStock: 15,   remainingStock: 15,   iconKey: 'backpack' },
  { name: 'Swag Box',      description: 'Ultimate bundle',    tier: 'legendary', weight: 0.8, totalStock: 10,   remainingStock: 10,   iconKey: 'swagbox' },
  { name: 'VIP Upgrade',   description: 'All-access pass',    tier: 'legendary', weight: 0.2, totalStock: 4,    remainingStock: 4,    iconKey: 'vip' },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB (zenith_prize)');

  await Prize.deleteMany({});
  await Prize.insertMany(PRIZES);
  console.log(`Seeded ${PRIZES.length} prizes`);

  await mongoose.disconnect();
  console.log('Seed complete');
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
