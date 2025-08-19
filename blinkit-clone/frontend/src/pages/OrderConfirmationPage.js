import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const response = await ordersAPI.getById(orderId);
      setOrder(response.data);
    } catch (error) {
      console.error('Error loading order:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading order details..." />;
  }

  if (!order) {
    return (
      <div style={{ marginTop: '80px' }}>
        <Container>
          <div className="text-center">
            <h4>Order not found</h4>
            <Button variant="success" onClick={() => navigate('/')}>
              Go Home
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', text: 'Pending' },
      confirmed: { variant: 'info', text: 'Confirmed' },
      out_for_delivery: { variant: 'primary', text: 'Out for Delivery' },
      delivered: { variant: 'success', text: 'Delivered' },
      cancelled: { variant: 'danger', text: 'Cancelled' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  return (
    <div style={{ marginTop: '80px' }}>
      <Container>
        <div className="order-confirmation">
          <div className="success-icon">✅</div>
          <h2 className="text-success mb-3">Order Placed Successfully!</h2>
          <p className="lead mb-4">
            Thank you for your order. We'll deliver your items as soon as possible.
          </p>
        </div>

        <Row>
          <Col md={8} className="mx-auto">
            <Card className="mb-4">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Order Details</h5>
                {getStatusBadge(order.status)}
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <p><strong>Order ID:</strong> {order._id}</p>
                    <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                    <p><strong>Payment ID:</strong> {order.paymentId || 'Processing'}</p>
                  </Col>
                  <Col md={6}>
                    <p><strong>Customer:</strong> {order.userDetails.name}</p>
                    <p><strong>Phone:</strong> {order.userDetails.phone}</p>
                    <p><strong>Address:</strong> {order.userDetails.address}</p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Order Items</h5>
              </Card.Header>
              <Card.Body>
                {order.items.map((item, index) => (
                  <div key={index} className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                    <div>
                      <h6 className="mb-1">{item.name}</h6>
                      <small className="text-muted">Quantity: {item.quantity}</small>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold">₹{item.price * item.quantity}</div>
                      <small className="text-muted">₹{item.price} each</small>
                    </div>
                  </div>
                ))}
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Payment Summary</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <span>₹{order.subtotal}</span>
                </div>
                
                {order.discount > 0 && (
                  <div className="d-flex justify-content-between mb-2 text-success">
                    <span>Discount ({order.couponCode}):</span>
                    <span>-₹{order.discount}</span>
                  </div>
                )}
                
                <div className="d-flex justify-content-between mb-2">
                  <span>Delivery Fee:</span>
                  <span className="text-success">FREE</span>
                </div>
                
                <hr />
                
                <div className="d-flex justify-content-between">
                  <strong>Total Paid:</strong>
                  <strong className="text-success">₹{order.totalAmount}</strong>
                </div>
              </Card.Body>
            </Card>

            <div className="text-center">
              <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                <Link to={`/track-order/${order._id}`}>
                  <Button variant="success" size="lg">
                    Track Your Order
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="outline-success" size="lg">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
              
              <div className="mt-4">
                <p className="text-muted">
                  📞 Need help? Contact us at <strong>+91 1234567890</strong>
                </p>
                <p className="text-muted">
                  📧 Email: <strong>support@blinkitclone.com</strong>
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default OrderConfirmationPage;