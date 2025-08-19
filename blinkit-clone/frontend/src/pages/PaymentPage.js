import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersAPI, paymentAPI } from '../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import RazorpayPayment from '../components/RazorpayPayment';

const PaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentKeys, setPaymentKeys] = useState({});

  useEffect(() => {
    loadOrderAndKeys();
  }, [orderId]);

  const loadOrderAndKeys = async () => {
    try {
      const [orderResponse, keysResponse] = await Promise.all([
        ordersAPI.getById(orderId),
        paymentAPI.getKeys()
      ]);

      setOrder(orderResponse.data);
      setPaymentKeys(keysResponse.data);
    } catch (error) {
      console.error('Error loading order and payment keys:', error);
      toast.error('Failed to load payment details');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentData) => {
    console.log('Payment successful:', paymentData);
    navigate(`/order-confirmation/${orderId}`);
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    toast.error(error || 'Payment failed. Please try again.');
  };

  if (loading) return <LoadingSpinner message="Loading payment details..." />;

  if (!order) {
    return (
      <Container style={{ marginTop: '80px' }}>
        <Alert variant="danger" className="text-center">
          <h4>Order not found</h4>
          <Button variant="success" onClick={() => navigate('/')}>
            Go Home
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!paymentKeys.razorpayKeyId) {
    return (
      <Container style={{ marginTop: '80px' }}>
        <Alert variant="warning" className="text-center">
          <h4>Razorpay not configured</h4>
          <p>Please configure Razorpay to enable payments.</p>
          <Button variant="success" onClick={() => navigate('/')}>
            Go Home
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container style={{ marginTop: '80px' }}>
      <Row>
        <Col md={8}>
          <Card className="form-section">
            <Card.Header>
              <h5>Payment via Razorpay</h5>
            </Card.Header>
            <Card.Body>
              <RazorpayPayment
                orderId={orderId}
                amount={order.totalAmount}
                razorpayKeyId={paymentKeys.razorpayKeyId}
                userDetails={order.userDetails}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </Card.Body>
          </Card>

          <Card className="mt-3">
            <Card.Body className="text-center">
              <h6 className="mb-3">🔒 Secure Payment</h6>
              <Row>
                <Col md={4}>
                  <div className="mb-2">🛡️</div>
                  <small>256-bit SSL Encryption</small>
                </Col>
                <Col md={4}>
                  <div className="mb-2">🏦</div>
                  <small>Bank-level Security</small>
                </Col>
                <Col md={4}>
                  <div className="mb-2">💳</div>
                  <small>PCI DSS Compliant</small>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <div className="total-section">
            <h5 className="mb-3">Order Summary</h5>

            <div className="order-summary mb-3">
              <div className="d-flex justify-content-between mb-2">
                <strong>Order ID:</strong>
                <span className="text-muted">{order._id.slice(-8)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Items ({order.items.length}):</span>
                <span>₹{order.subtotal}</span>
              </div>
              {order.discount > 0 && (
                <div className="d-flex justify-content-between mb-2 text-success">
                  <span>Discount ({order.couponCode}):</span>
                  <span>-₹{order.discount}</span>
                </div>
              )}
              <div className="d-flex justify-content-between mb-2">
                <span>Delivery:</span>
                <span className="text-success">FREE</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-3">
                <strong>Total Amount:</strong>
                <strong className="text-success">₹{order.totalAmount}</strong>
              </div>
            </div>

            <div className="mb-3">
              <h6 className="mb-2">Items in this order:</h6>
              {order.items.slice(0, 3).map((item, idx) => (
                <div key={idx} className="d-flex justify-content-between mb-1">
                  <small>{item.name} x{item.quantity}</small>
                  <small>₹{item.price * item.quantity}</small>
                </div>
              ))}
              {order.items.length > 3 && (
                <small className="text-muted">
                  +{order.items.length - 3} more items
                </small>
              )}
            </div>

            <div className="mb-3">
              <h6 className="mb-2">Delivery Address:</h6>
              <small className="text-muted">
                {order.userDetails.name}<br />
                {order.userDetails.address}<br />
                Phone: +91 {order.userDetails.phone}
              </small>
            </div>

            <div className="text-center">
              <small className="text-muted">
                Need help? Contact us at +91 1234567890
              </small>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default PaymentPage;
