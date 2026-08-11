const mongoose = require('mongoose');

const globalCache = globalThis.__mongoCache || (globalThis.__mongoCache = {
  conn: null,
  promise: null
});

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecommerce-app';

    if (globalCache.conn) {
      return globalCache.conn;
    }

    if (!globalCache.promise) {
      globalCache.promise = mongoose.connect(mongoUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000
      });
    }

    const conn = await globalCache.promise;
    globalCache.conn = conn;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    globalCache.promise = null;
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
