const Store = require('../models/Store');

// Create a new store (vendor only)
const createStore = async (req, res) => {
  try {
    const { storeName, description } = req.body;

    const existingStore = await Store.findOne({ vendorId: req.user.id });
    if (existingStore) {
      return res.status(400).json({ message: 'You already have a store' });
    }

    const store = await Store.create({
      vendorId: req.user.id,
      storeName,
      description,
    });

    res.status(201).json({ message: 'Store created successfully', store });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get the logged-in vendor's store
const getMyStore = async (req, res) => {
  try {
    const store = await Store.findOne({ vendorId: req.user.id });
    if (!store) {
      return res.status(404).json({ message: 'No store found' });
    }
    res.status(200).json({ store });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all stores (public)
const getAllStores = async (req, res) => {
  try {
    const stores = await Store.find({ isApproved: true });
    res.status(200).json({ stores });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createStore, getMyStore, getAllStores };