import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ordersAPI } from '../services/api';
import { toast } from 'react-toastify';

const OrderPage = () => {
  const { items, totalAmount, userId } = useCart();
  const navigate = useNavigate();
  
  const [userDetails, setUserDetails] = useState({
    name: '',
    phone: '',
    address: ''
  });
  
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);

  const handleInputChange = (e) => {
    setUserDetails({
      ...userDetails,
      [e.target.name]: e.target.value
    });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    try {
      setCouponLoading(true);
      const response = await ordersAPI.validateCoupon({
        couponCode: couponCode.trim(),
        subtotal: totalAmount
      });
      
      setDiscount(response.data.discount);
      setCouponApplied(true);
      toast.success(`Coupon applied! You saved ₹${response.data.discount}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setDiscount(0);
    setCouponApplied(false);
    toast.info('Coupon removed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userDetails.name || !userDetails.phone || !userDetails.address) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      navigate('/');
      return;
    }

    try {
      setLoading(true);
      const orderData = {
        userId,
        userDetails,
        couponCode: couponApplied ? couponCode : null
      };

      const response = await ordersAPI.create(orderData);
      toast.success('Order created successfully!');
      navigate(`/payment/${response.data._id}`);
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(error.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div style={{ marginTop: '80px' }}>
        <Container>
          <Alert variant="warning" className="text-center">
            <h4>Your cart is empty</h4>
            <p>Please add some items to your cart before placing an order.</p>
            <Button variant="success" onClick={() => navigate('/')}>
              Continue Shopping
            </Button>
          </Alert>
        </Container>
      </div>
    );
  }

  const finalAmount = totalAmount - discount;

  return (
    <div style={{ marginTop: '80px' }}>
      <Container>
        <Row>
          <Col md={8}>
            {/* Order Summary */}
            <Card className="form-section">
              <Card.Header>
                <h5>Order Summary</h5>
              </Card.Header>
              <Card.Body>
                {items.map(item => (
                  <div key={item.productId._id} className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <strong>{item.productId.name}</strong>
                      <small className="text-muted"> x {item.quantity}</small>
                    </div>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </Card.Body>
            </Card>

            {/* Coupon Section */}
            <Card className="form-section">
              <Card.Header>
                <h5>Apply Coupon</h5>
              </Card.Header>
              <Card.Body>
                <div className="coupon-section">
                  <p className="mb-2">
                    <strong>Available Coupons:</strong>
                  </p>
                  <ul className="mb-3">
                    <li><code>FLAT10</code> - Get 10% off on your order</li>
                  </ul>
                  
                  {!couponApplied ? (
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      />
                      <Button 
                        variant="success" 
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                      >
                        {couponLoading ? 'Applying...' : 'Apply'}
                      </Button>
                    </InputGroup>
                  ) : (
                    <Alert variant="success" className="d-flex justify-content-between align-items-center">
                      <span>
                        Coupon <strong>{couponCode}</strong> applied! 
                        You saved ₹{discount}
                      </span>
                      <Button 
                        variant="outline-success" 
                        size="sm"
                        onClick={handleRemoveCoupon}
                      >
                        Remove
                      </Button>
                    </Alert>
                  )}
                </div>
              </Card.Body>
            </Card>

            {/* User Details Form */}
            <Card className="form-section">
              <Card.Header>
                <h5>Delivery Details</h5>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Full Name *</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={userDetails.name}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Phone Number *</Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={userDetails.phone}
                          onChange={handleInputChange}
                          placeholder="Enter your phone number"
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Delivery Address *</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="address"
                      value={userDetails.address}
                      onChange={handleInputChange}
                      placeholder="Enter your complete delivery address"
                      required
                    />
                  </Form.Group>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <div className="total-section">
              <h5 className="mb-3">Price Details</h5>
              
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal ({items.length} items):</span>
                <span>₹{totalAmount}</span>
              </div>
              
              {discount > 0 && (
                <div className="d-flex justify-content-between mb-2 text-success">
                  <span>Coupon Discount:</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              
              <div className="d-flex justify-content-between mb-2">
                <span>Delivery Fee:</span>
                <span className="text-success">FREE</span>
              </div>
              
              <hr />
              
              <div className="d-flex justify-content-between mb-3">
                <strong>Total Amount:</strong>
                <strong className="text-success">₹{finalAmount}</strong>
              </div>
              
              <div className="d-grid">
                <Button 
                  variant="success" 
                  size="lg"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Creating Order...' : 'Proceed to Payment'}
                </Button>
              </div>
              
              <div className="mt-3 text-center">
                <small className="text-muted">
                  🔒 Your order details are secure
                </small>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default OrderPage;