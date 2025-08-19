const express = require('express');
const DeliveryPartner = require('../models/DeliveryPartner');
const Order = require('../models/Order');
const router = express.Router();

// Get all delivery partners
router.get('/', async (req, res) => {
  try {
    const partners = await DeliveryPartner.find();
    res.json(partners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get available delivery partners
router.get('/available', async (req, res) => {
  try {
    const partners = await DeliveryPartner.find({ isAvailable: true });
    res.json(partners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get delivery partner by ID
router.get('/:id', async (req, res) => {
  try {
    const partner = await DeliveryPartner.findById(req.params.id);
    if (!partner) {
      return res.status(404).json({ message: 'Delivery partner not found' });
    }
    res.json(partner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update delivery partner availability
router.put('/:id/availability', async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const partner = await DeliveryPartner.findById(req.params.id);
    
    if (!partner) {
      return res.status(404).json({ message: 'Delivery partner not found' });
    }

    partner.isAvailable = isAvailable;
    if (isAvailable) {
      partner.currentOrderId = null;
    }
    
    await partner.save();
    res.json(partner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Complete delivery
router.put('/complete/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update order status
    order.status = 'delivered';
    await order.save();

    // Free up delivery partner
    if (order.deliveryPartnerId) {
      const partner = await DeliveryPartner.findById(order.deliveryPartnerId);
      if (partner) {
        partner.isAvailable = true;
        partner.currentOrderId = null;
        await partner.save();
      }
    }

    res.json({ message: 'Delivery completed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Track order delivery
router.get('/track/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('deliveryPartnerId');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const trackingInfo = {
      orderId: order._id,
      status: order.status,
      deliveryPartner: order.deliveryPartnerId ? {
        name: order.deliveryPartnerId.name,
        phone: order.deliveryPartnerId.phone,
        vehicleNumber: order.deliveryPartnerId.vehicleNumber
      } : null,
      estimatedDelivery: order.deliveryPartnerId ? '10-15 minutes' : 'Waiting for assignment'
    };

    res.json(trackingInfo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;