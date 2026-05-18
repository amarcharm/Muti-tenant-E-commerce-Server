const mongoose = require('mongoose');

const database = () => {
  mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => console.error('DB connection error:', err));

}


  module.exports = database