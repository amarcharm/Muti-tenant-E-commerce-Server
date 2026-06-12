const express = require('express');
const router  = express.Router();
const {
  addProduct,
  getMyProducts,
  getAllProducts,
  deleteProduct,
} = require('../controllers/productController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Public — anyone can browse all products
router.get('/', getAllProducts);

// Vendor only
router.post('/add',        verifyToken, authorizeRoles('vendor'), addProduct);
router.get('/my-products', verifyToken, authorizeRoles('vendor'), getMyProducts);
router.delete('/:id',      verifyToken, authorizeRoles('vendor'), deleteProduct);

module.exports = router;