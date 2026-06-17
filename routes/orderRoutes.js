const express = require('express');
const router  = express.Router();
const {
  placeOrder,
  getMyOrders,
  getOrderById,
  getVendorOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Customer routes
router.post('/',   verifyToken, authorizeRoles('customer', 'vendor', 'superadmin'), placeOrder);
router.get('/my',  verifyToken, getMyOrders);

// Vendor routes
router.get('/vendor-orders',  verifyToken, authorizeRoles('vendor', 'superadmin'), getVendorOrders);
router.patch('/:id/status',   verifyToken, authorizeRoles('vendor', 'superadmin'), updateOrderStatus);

// Shared — must come after named routes
router.get('/:id', verifyToken, getOrderById);

module.exports = router;