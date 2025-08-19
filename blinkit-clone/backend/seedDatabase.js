const mongoose = require('mongoose');
const Product = require('./models/Product');
const DeliveryPartner = require('./models/DeliveryPartner');

// Connect to MongoDB
mongoose.connect('mongodb+srv://Ridhi:Yash2106@cluster0.iyssd.mongodb.net/blinkit?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => console.log('MongoDB connection error:', err));

const sampleProducts = [
  {
    name: 'Fresh Milk',
    description: 'Fresh whole milk - 1 liter',
    price: 60,
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300',
    category: 'Dairy',
    inStock: true,
    quantity: 50
  },
  {
    name: 'Brown Bread',
    description: 'Whole wheat brown bread',
    price: 40,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300',
    category: 'Bakery',
    inStock: true,
    quantity: 30
  },
  {
    name: 'Bananas',
    description: 'Fresh bananas - 1 dozen',
    price: 50,
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300',
    category: 'Fruits',
    inStock: true,
    quantity: 100
  },
  {
    name: 'Eggs',
    description: 'Farm fresh eggs - 12 pieces',
    price: 80,
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=300',
    category: 'Dairy',
    inStock: true,
    quantity: 40
  },
  {
    name: 'Tomatoes',
    description: 'Fresh red tomatoes - 1 kg',
    price: 45,
    image: 'https://images.unsplash.com/photo-1546470427-e9e8b6d7e3c8?w=300',
    category: 'Vegetables',
    inStock: true,
    quantity: 60
  },
  {
    name: 'Potatoes',
    description: 'Fresh potatoes - 1 kg',
    price: 30,
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300',
    category: 'Vegetables',
    inStock: true,
    quantity: 80
  },
  {
    name: 'Onions',
    description: 'Fresh red onions - 1 kg',
    price: 35,
    image: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=300',
    category: 'Vegetables',
    inStock: true,
    quantity: 70
  },
  {
    name: 'Apples',
    description: 'Fresh red apples - 1 kg',
    price: 120,
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300',
    category: 'Fruits',
    inStock: true,
    quantity: 45
  },
  {
    name: 'Rice',
    description: 'Basmati rice - 1 kg',
    price: 90,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300',
    category: 'Groceries',
    inStock: true,
    quantity: 25
  },
  {
    name: 'Chicken',
    description: 'Fresh chicken - 1 kg',
    price: 200,
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300',
    category: 'Meat',
    inStock: true,
    quantity: 20
  }
];

const sampleDeliveryPartners = [
  {
    name: 'Rahul Kumar',
    phone: '+91 9876543210',
    vehicleNumber: 'DL-01-AB-1234',
    isAvailable: true,
    location: { lat: 28.6139, lng: 77.2090 }
  },
  {
    name: 'Amit Singh',
    phone: '+91 9876543211',
    vehicleNumber: 'DL-02-CD-5678',
    isAvailable: true,
    location: { lat: 28.6129, lng: 77.2295 }
  },
  {
    name: 'Priya Sharma',
    phone: '+91 9876543212',
    vehicleNumber: 'DL-03-EF-9012',
    isAvailable: true,
    location: { lat: 28.6169, lng: 77.2065 }
  },
  {
    name: 'Vikash Yadav',
    phone: '+91 9876543213',
    vehicleNumber: 'DL-04-GH-3456',
    isAvailable: true,
    location: { lat: 28.6149, lng: 77.2085 }
  },
  {
    name: 'Neha Gupta',
    phone: '+91 9876543214',
    vehicleNumber: 'DL-05-IJ-7890',
    isAvailable: true,
    location: { lat: 28.6159, lng: 77.2075 }
  }
];

async function seedDatabase() {
  try {
    // Clear existing data
    await Product.deleteMany({});
    await DeliveryPartner.deleteMany({});

    // Insert sample products
    await Product.insertMany(sampleProducts);
    console.log('Sample products inserted');

    // Insert sample delivery partners
    await DeliveryPartner.insertMany(sampleDeliveryPartners);
    console.log('Sample delivery partners inserted');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();