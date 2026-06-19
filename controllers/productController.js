const Product = require('../models/Product');
const Store   = require('../models/Store');

// Vendor adds a product with optional image upload
const addProduct = async (req, res) => {
  try {
    const { name, price, stock, category, description } = req.body;

    // Find the vendor's store
    const store = await Store.findOne({ vendorId: req.user.id });
    if (!store) {
      return res.status(404).json({
        message: 'You do not have a store. Create one first.',
      });
    }

    // If an image was uploaded, req.file will have the Cloudinary URL
    const imageUrl = req.file ? req.file.path : '';

    const product = await Product.create({
      storeId:     store._id,
      name,
      price:       Number(price),
      stock:       Number(stock),
      category,
      description,
      images:      imageUrl ? [imageUrl] : [],
    });

    res.status(201).json({ message: 'Product added successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all products of the vendor's store
const getMyProducts = async (req, res) => {
  try {
    const store = await Store.findOne({ vendorId: req.user.id });
    if (!store) {
      return res.status(404).json({ message: 'No store found' });
    }
    const products = await Product.find({ storeId: store._id });
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all products (public)
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('storeId', 'storeName');
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('storeId', 'storeName');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ product });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const store = await Store.findOne({ vendorId: req.user.id });
    if (!store || product.storeId.toString() !== store._id.toString()) {
      return res.status(403).json({
        message: 'Not authorized to delete this product',
      });
    }
    await product.deleteOne();
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  addProduct,
  getMyProducts,
  getAllProducts,
  getProductById,
  deleteProduct,
};