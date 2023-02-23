const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.sample' });
// Set up options for Mongoose
const mongooseOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
  poolSize: 100, // maximum number of sockets that may be opened for the connection
  keepAlive: true, // keep the connection alive by sending keepAlive messages every 30 seconds
  keepAliveInitialDelay: 300000 // initial delay before sending the first keepAlive message
};

module.exports = () => {
  // Connect to the MongoDB database using the MONGODB_URI environment variable and Mongoose options
  mongoose.connect(process.env.MONGODB_URI, mongooseOptions)
    .catch(console.error);
};
