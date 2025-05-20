// resetPermissions.js
import 'dotenv/config';
import mongoose from 'mongoose';
import PermissionProfile from './src/models/PermissionProfile.js';

async function reset() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Drop the entire PermissionProfile collection:
  await PermissionProfile.collection.drop();
  console.log('⚠️  Dropped PermissionProfile collection');

  await mongoose.disconnect();
  console.log('Done. Exiting.');
  process.exit(0);
}

reset().catch(err => {
  console.error('Reset failed:', err);
  process.exit(1);
});
