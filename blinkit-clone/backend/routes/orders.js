const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const router = express.Router();

// Create new order
router.post('/create', async (req, res) => {
  try {
    const { userId, userDetails, couponCode } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    let subtotal = cart.totalAmount;
    let discount = 0;

    // Apply coupon if provided
    if (couponCode) {
      if (couponCode === 'FLAT10') {
        discount = subtotal * 0.1; // 10% discount
      } else {
        return res.status(400).json({ message: 'Invalid coupon code' });
      }
    }

    const totalAmount = subtotal - discount;

    // Create order items
    const orderItems = cart.items.map(item => ({
      productId: item.productId._id,
      name: item.productId.name,
      quantity: item.quantity,
      price: item.price
    }));

    // Create order
    const order = new Order({
      userId,
      items: orderItems,
      userDetails,
      subtotal,
      discount,
      totalAmount,
      couponCode,
      status: 'pending'
    });

    await order.save();

    // Clear cart after order creation
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('deliveryPartnerId');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get orders by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .populate('deliveryPartnerId')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Validate coupon
router.post('/validate-coupon', async (req, res) => {
  try {
    const { couponCode, subtotal } = req.body;

    let discount = 0;
    let isValid = false;

    if (couponCode === 'FLAT10') {
      discount = subtotal * 0.1; // 10% discount
      isValid = true;
    }

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid coupon code' });
    }

    res.json({
      isValid: true,
      discount,
      finalAmount: subtotal - discount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;