require('dotenv').config();
const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

const router = express.Router();

// -------------------- Initialize Payment Gateways --------------------
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// -------------------- Get Keys --------------------
router.get('/keys', (req, res) => {
  res.json({
    razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  });
});

// -------------------- RAZORPAY: Create Order --------------------
router.post('/razorpay/create-order', async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.totalAmount * 100), // in paise
      currency: 'INR',
      receipt: `receipt_${order._id}`,
      notes: { orderId: order._id.toString() },
    });

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Razorpay create order error:', error);
    res.status(500).json({ message: 'Failed to create Razorpay order' });
  }
});

// -------------------- RAZORPAY: Verify Payment --------------------
router.post('/razorpay/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ message: 'Order not found' });

      order.paymentId = razorpay_payment_id;
      order.status = 'confirmed';
      await order.save();

      return res.json({
        success: true,
        paymentId: razorpay_payment_id,
        orderId: order._id,
        message: 'Payment verified successfully',
      });
    }

    res.status(400).json({ message: 'Invalid payment signature' });
  } catch (error) {
    console.error('Razorpay verify error:', error);
    res.status(500).json({ message: 'Failed to verify payment' });
  }
});

// -------------------- Payment Status --------------------
router.get('/status/:paymentId', async (req, res) => {
  try {
    const order = await Order.findOne({ paymentId: req.params.paymentId });
    if (!order) return res.status(404).json({ message: 'Payment not found' });

    res.json({
      paymentId: req.params.paymentId,
      status: order.status === 'confirmed' ? 'completed' : order.status,
      orderId: order._id,
      amount: order.totalAmount,
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ message: 'Failed to get payment status' });
  }
});

// -------------------- Refund Payment --------------------
router.post('/refund', async (req, res) => {
  try {
    const { paymentId, amount, reason = 'requested_by_customer' } = req.body;

    const order = await Order.findOne({ paymentId });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    let refund;

    if (paymentId.startsWith('pay_')) {
      // RAZORPAY Refund
      refund = await razorpay.payments.refund(paymentId, {
        amount: amount ? Math.round(amount * 100) : undefined,
        notes: { reason, orderId: order._id.toString() },
      });
    } else {
      return res.status(400).json({ message: 'Invalid payment ID format' });
    }

    order.status = 'refunded';
    await order.save();

    res.json({
      success: true,
      refundId: refund.id,
      amount: refund.amount / 100,
      status: refund.status || 'refunded',
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ message: 'Failed to process refund' });
  }
});

module.exports = router;