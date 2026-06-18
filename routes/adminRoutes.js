const express = require('express');
const router  = express.Router();
const {
  getPlatformStats,
  getAllStores,
  approveStore,
  rejectStore,
  getAllVendors,
  approveVendor,
  rejectVendor,
  getAllOrders,
  deleteVendor,
} = require('../controllers/adminController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// All routes — superadmin only
router.get('/stats',              verifyToken, authorizeRoles('superadmin'), getPlatformStats);
router.get('/stores',             verifyToken, authorizeRoles('superadmin'), getAllStores);
router.patch('/stores/:id/approve', verifyToken, authorizeRoles('superadmin'), approveStore);
router.patch('/stores/:id/reject',  verifyToken, authorizeRoles('superadmin'), rejectStore);
router.get('/vendors',             verifyToken, authorizeRoles('superadmin'), getAllVendors);
router.patch('/vendors/:id/approve', verifyToken, authorizeRoles('superadmin'), approveVendor);
router.patch('/vendors/:id/reject',  verifyToken, authorizeRoles('superadmin'), rejectVendor);
router.get('/orders',              verifyToken, authorizeRoles('superadmin'), getAllOrders);
router.delete('/vendors/:id',      verifyToken, authorizeRoles('superadmin'), deleteVendor);

module.exports = router;