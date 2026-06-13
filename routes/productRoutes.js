const express = require('express');
const router  = express.Router();
const {
  addProduct,
  getMyProducts,
  getAllProducts,
  deleteProduct,
  getProductById,       
} = require('../controllers/productController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/',            getAllProducts);
router.get('/my-products', verifyToken, authorizeRoles('vendor'), getMyProducts);
router.get('/:id',         getProductById);                        
router.post('/add',        verifyToken, authorizeRoles('vendor'), addProduct);
router.delete('/:id',      verifyToken, authorizeRoles('vendor'), deleteProduct);

module.exports = router;