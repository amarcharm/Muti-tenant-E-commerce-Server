const Order = require('../models/Order');
const Product = require('../models/Product');

// Place a new order
const placeOrder = async (req, res) => {
  try {
    const { items, deliveryAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    // Calculate total and validate each product
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name}. Available: ${product.stock}`,
        });
      }

      // Deduct stock
      product.stock -= item.quantity;
      await product.save();

      totalAmount += product.price * item.quantity;

      orderItems.push({
        productId: product._id,
        quantity:  item.quantity,
        price:     product.price,
      });
    }

    // Get storeId from first product
    const firstProduct = await Product.findById(items[0].productId);

    const order = await Order.create({
      customerId:      req.user.id,
      storeId:         firstProduct.storeId,
      items:           orderItems,
      totalAmount,
      deliveryAddress,
      status:          'pending',
    });

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all orders for the logged-in customer
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user.id })
      .populate('storeId', 'storeName')
      .populate('items.productId', 'name price')
      .sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single order by ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('storeId', 'storeName')
      .populate('items.productId', 'name price category');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only the customer who placed it can view it
    if (order.customerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.status(200).json({ order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all orders for the vendor's store
const getVendorOrders = async (req, res) => {
  try {
    const Store = require('../models/Store');

    // Find vendor's store first
    const store = await Store.findOne({ vendorId: req.user.id });
    if (!store) {
      return res.status(404).json({ message: 'No store found. Create a store first.' });
    }

    const orders = await Order.find({ storeId: store._id })
      .populate('customerId', 'name email')
      .populate('items.productId', 'name price')
      .sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const Store = require('../models/Store');
    const { status } = req.body;

    const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Make sure this order belongs to the vendor's store
    const store = await Store.findOne({ vendorId: req.user.id });
    if (!store || order.storeId.toString() !== store._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    order.status = status;
    await order.save();

    res.status(200).json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { placeOrder, getMyOrders, getOrderById, getVendorOrders, updateOrderStatus, };