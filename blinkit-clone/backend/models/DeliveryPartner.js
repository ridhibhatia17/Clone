const mongoose = require('mongoose');

const deliveryPartnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  vehicleNumber: {
    type: String,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  currentOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  location: {
    lat: {
      type: Number,
      default: 0
    },
    lng: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DeliveryPartner', deliveryPartnerSchema);