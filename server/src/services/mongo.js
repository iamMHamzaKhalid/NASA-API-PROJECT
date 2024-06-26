const mongoose = require('mongoose');

require('dotenv').config();

// Update below to match your own MongoDB connection string.
const MONGO_URL = process.env.MONGO_URL;

mongoose.connection.once('open', () => {
  console.log('MongoDB connection ready!');
});


mongoose.connection.on('error', (err) => {
    console.error('MongoDB Connection error:' + err);
  });
  mongoose.connection.on('disconnected', () => {
    console.log('Disconnected from MongoDB');
  });
  
async function mongoConnect() {
  await mongoose.connect(MONGO_URL);
}

async function mongoDisconnect() {
  await mongoose.disconnect();
}

module.exports = {
  mongoConnect,
  mongoDisconnect,
};
