import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import AdminUser from './models/AdminUser.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/zenith_auth';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB (zenith_auth)');

  await AdminUser.deleteMany({});
  const hash = await bcrypt.hash('zenith', 10);
  await AdminUser.create({ username: 'admin', passwordHash: hash });
  console.log('Seeded admin user (admin / zenith)');

  await mongoose.disconnect();
  console.log('Seed complete');
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
