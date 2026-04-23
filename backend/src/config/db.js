import mongoose from 'mongoose';

/** Removes wrong unique index on doctors.email (schema stores email on User, not Doctor). */
async function dropLegacyDoctorEmailIndex() {
  try {
    const coll = mongoose.connection.db.collection('doctors');
    const indexes = await coll.indexes();
    for (const ix of indexes) {
      const keys = ix.key || {};
      const onlyEmail =
        Object.keys(keys).length === 1 && Object.prototype.hasOwnProperty.call(keys, 'email');
      if (!onlyEmail || ix.name === '_id_') continue;
      await coll.dropIndex(ix.name);
      console.log(
        `[db] Dropped legacy doctors index "${ix.name}" — Doctor has no email field (use userId → User).`
      );
    }
  } catch (e) {
    const msg = String(e.message || '');
    if (e.code === 26 || e.codeName === 'NamespaceNotFound') return;
    if (/ns not found|index not found/i.test(msg)) return;
    console.warn('[db] Legacy index cleanup:', msg);
  }
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('MongoDB connected');
  await dropLegacyDoctorEmailIndex();
}
