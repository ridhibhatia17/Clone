const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  items: [orderItemSchema],
  userDetails: {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  subtotal: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  couponCode: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentId: {
    type: String,
    default: null
  },
  deliveryPartnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryPartner',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);