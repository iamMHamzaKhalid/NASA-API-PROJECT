const http = require('http');
require('dotenv').config();

const app = require('./app');
const { mongoConnect } = require('./services/mongo');
const { loadPlanetsData } = require('./models/planets.model');
const { loadLaunchData } = require('./models/launches.model');
const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

async function startServer() {
  await mongoConnect(); // connect to database
  await loadPlanetsData(); // load data before starting server
  await loadLaunchData(); // load data before starting server

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
// process.on('SIGINT', async () => {
//   console.log('Received SIGINT. Closing server and MongoDB connection...');
//   try {
//     await server.close(); // Close the HTTP server
//     await mongoose.connection.close(); // Close the MongoDB connection
//     console.log('Server and MongoDB connection closed.');
//     process.exit(0); // Exit the process gracefully
//   } catch (err) {
//     console.error('Error during shutdown:', err);
//     process.exit(1); // Exit with an error code
//   }
// });
