const mongoose = require('mongoose');
const dns = require('dns');

// Force Node to use Google's DNS to resolve MongoDB Atlas SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
  } catch (err) {
    console.error(`[MongoDB Connection Error] ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;