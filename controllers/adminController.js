const User    = require('../models/User');
const Store   = require('../models/Store');
const Product = require('../models/Product');
const Order   = require('../models/Order');

// Get platform-wide stats
const getPlatformStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalVendors,
      totalStores,
      totalProducts,
      totalOrders,
      allOrders,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'vendor' }),
      Store.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.find({ status: { $ne: 'cancelled' } }),
    ]);

    const totalRevenue = allOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const pendingStores = await Store.countDocuments({ isApproved: false });

    res.status(200).json({
      stats: {
        totalUsers,
        totalVendors,
        totalStores,
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingStores,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all stores with vendor info
const getAllStores = async (req, res) => {
  try {
    const stores = await Store.find()
      .populate('vendorId', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ stores });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Approve a store
const approveStore = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    store.isApproved = true;
    await store.save();
    res.status(200).json({ message: 'Store approved successfully', store });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reject a store
const rejectStore = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    store.isApproved = false;
    await store.save();
    res.status(200).json({ message: 'Store rejected', store });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all vendors
const getAllVendors = async (req, res) => {
  try {
    const vendors = await User.find({ role: 'vendor' })
      .select('name email approved createdAt')
      .sort({ createdAt: -1 });
    res.status(200).json({ vendors });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Approve a vendor
const approveVendor = async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id);
    if (!vendor || vendor.role !== 'vendor') {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    vendor.approved = true;
    await vendor.save();
    res.status(200).json({ message: 'Vendor approved successfully', vendor });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reject a vendor
const rejectVendor = async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id);
    if (!vendor || vendor.role !== 'vendor') {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    vendor.approved = false;
    await vendor.save();
    res.status(200).json({ message: 'Vendor rejected successfully', vendor });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all orders across platform
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customerId', 'name email')
      .populate('storeId', 'storeName')
      .populate('items.productId', 'name price')
      .sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a vendor account
const deleteVendor = async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    if (vendor.role === 'superadmin') {
      return res.status(403).json({ message: 'Cannot delete a superadmin' });
    }
    await vendor.deleteOne();
    res.status(200).json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getPlatformStats,
  getAllStores,
  approveStore,
  rejectStore,
  getAllVendors,
  approveVendor,
  rejectVendor,
  getAllOrders,
  deleteVendor,
};