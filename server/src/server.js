require('dotenv').config();

const http = require('http');
const mongoose = require('mongoose');
const app = require('./app.js');
const { loadPlanetsData } = require('./models/planets.model.js');

const PORT = process.env.PORT || 8000;
const server = http.createServer(app);
const MONGO_URI = process.env.MONGO_URL;

mongoose.connection.once('open', () => {
  console.log('MongoDB Connection ready!');
});
mongoose.connection.on('error', (err) => {
  console.error('MongoDB Connection error:' + err);
});
mongoose.connection.on('disconnected', () => {
  console.log('Disconnected from MongoDB');
});

async function startServer() {
  await mongoose.connect(MONGO_URI); // connect to database

  await loadPlanetsData(); // load data before starting server

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  /* 
  const promise = loadPlanetsData(); // load data before starting server
  promise.then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }); 
  */
}

startServer();
//changes to check the remote push state
process.on('SIGINT', async () => {
  console.log('Received SIGINT. Closing server and MongoDB connection...');
  try {
    await server.close(); // Close the HTTP server
    await mongoose.connection.close(); // Close the MongoDB connection
    console.log('Server and MongoDB connection closed.');
    process.exit(0); // Exit the process gracefully
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1); // Exit with an error code
  }
});
