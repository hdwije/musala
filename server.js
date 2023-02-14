require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const connectDB = require('./config/dbConn');
const gatewayRoute = require('./routes/gatewayRoutes');
const deviceRoute = require('./routes/deviceRoutes');

const app = express();
const port = process.env.PORT || 3700;

connectDB();

app.use(cors());
app.use(express.json());
app.use('/gateways', gatewayRoute);
app.use('/devices', deviceRoute);

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  app.listen(port, () => console.log(`Server is running on port ${port}`));
});

mongoose.connection.on('error', (error) => {
  console.error(error);
  const logMessage = `${error.no}: ${error.code}\t${error.syscall}\t${error.hostname}`;
  logEvents(logMessage, 'mongoErrLog.log');
});
