const mongoose = require('mongoose');
const dns = require('dns');

// Enforce Google DNS only when resolving MongoDB Atlas SRV clusters
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cyvora';
if (mongoUri.includes('+srv')) {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
  } catch (err) {
    console.error(`[MongoDB Connection Error] ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;