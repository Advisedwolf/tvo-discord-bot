// scripts/flush-db.js
import 'dotenv/config';
import mongoose from 'mongoose';

async function run() {
  // 1) Connect
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // 2) Drop the entire database
  await mongoose.connection.dropDatabase();
  console.log('💥 Database dropped');

  // 3) Exit cleanly
  process.exit(0);
}

run().catch(err => {
  console.error('🚨 Error dropping DB:', err);
  process.exit(1);
});
