const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const morgan = require('morgan')
const database = require('./config/database')

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'))

app.listen(process.env.PORT, () => {
      database()
      console.log(`Server running on port http://localhost:5555`);
    });





 