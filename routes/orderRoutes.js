const express = require('express');
const router  = express.Router();
const {
  placeOrder,
  getMyOrders,
  getOrderById,
} = require('../controllers/orderController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Customer only routes
router.post('/',       verifyToken, authorizeRoles('customer', 'vendor', 'superadmin'), placeOrder);
router.get('/my',      verifyToken, getMyOrders);
router.get('/:id',     verifyToken, getOrderById);

module.exports = router;