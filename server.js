const express = require('express')
const cors = require('cors')
const helmet = require('helmet')

require('dotenv').config()

const morgan = require('morgan')
const database = require('./config/database')

const authRoutes = require('./routes/authRoutes')
const vendorRoutes = require('./routes/vendorRoutes')
const adminRoutes = require('./routes/adminRoutes')
const storeRoutes = require('./routes/storeRoutes')
const productRoutes = require('./routes/productRoutes')
const orderRoutes = require('./routes/orderRoutes')

const app = express()

//middlewares
app.use(express.json())
app.use(cors())
app.use(helmet())
app.use(morgan('dev'))
app.use('/api/auth', authRoutes)
app.use('/api/stores', storeRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/admin', adminRoutes)

app.listen(process.env.PORT, () => {
      database()
      console.log(`Server running on port http://localhost:5555`);
    });






 