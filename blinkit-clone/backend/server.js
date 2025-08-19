const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');

// Import routes
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payment');
const deliveryRoutes = require('./routes/delivery');

// Import models
const Order = require('./models/Order');
const DeliveryPartner = require('./models/DeliveryPartner');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blinkit-clone')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/delivery', deliveryRoutes);

// Delivery partner assignment cron job - runs every minute
cron.schedule('* * * * *', async () => {
  try {
    const pendingOrders = await Order.find({ 
      status: 'confirmed',
      deliveryPartnerId: null 
    });

    for (const order of pendingOrders) {
      const orderTime = new Date(order.createdAt);
      const currentTime = new Date();
      const timeDiff = (currentTime - orderTime) / (1000 * 60); // in minutes

      // Check if user has previous orders
      const userOrders = await Order.find({ 
        userId: order.userId,
        status: { $in: ['confirmed', 'out_for_delivery', 'delivered'] },
        deliveryPartnerId: { $ne: null }
      }).sort({ createdAt: -1 });

      let shouldAssign = false;

      if (userOrders.length === 0) {
        // First order - assign after 3 minutes
        shouldAssign = timeDiff >= 3;
      } else {
        // Subsequent orders - assign after 15 minutes
        shouldAssign = timeDiff >= 15;
      }

      if (shouldAssign) {
        // Find available delivery partner
        const availablePartner = await DeliveryPartner.findOne({ 
          isAvailable: true 
        });

        if (availablePartner) {
          order.deliveryPartnerId = availablePartner._id;
          order.status = 'out_for_delivery';
          await order.save();

          // Mark partner as busy
          availablePartner.isAvailable = false;
          availablePartner.currentOrderId = order._id;
          await availablePartner.save();

          console.log(`Order ${order._id} assigned to delivery partner ${availablePartner.name}`);
        }
      }
    }
  } catch (error) {
    console.error('Error in delivery assignment cron job:', error);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});