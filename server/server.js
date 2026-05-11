const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();


const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());


// Connect to MongoDB 
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port http://localhost:5555`);
    });
  })
  .catch((err) => console.error('DB connection error:', err));



 