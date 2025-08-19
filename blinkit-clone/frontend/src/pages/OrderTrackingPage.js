import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { deliveryAPI, ordersAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const OrderTrackingPage = () => {
  const { orderId } = useParams();
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrackingInfo();
    // Refresh tracking info every 30 seconds
    const interval = setInterval(loadTrackingInfo, 30000);
    return () => clearInterval(interval);
  }, [orderId]);

  const loadTrackingInfo = async () => {
    try {
      const [trackingResponse, orderResponse] = await Promise.all([
        deliveryAPI.trackOrder(orderId),
        ordersAPI.getById(orderId)
      ]);
      
      setTrackingInfo(trackingResponse.data);
      setOrder(orderResponse.data);
    } catch (error) {
      console.error('Error loading tracking info:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading tracking information..." />;
  }

  if (!trackingInfo || !order) {
    return (
      <div style={{ marginTop: '80px' }}>
        <Container>
          <Alert variant="danger" className="text-center">
            <h4>Tracking information not available</h4>
            <p>Please check your order ID and try again.</p>
          </Alert>
        </Container>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', text: 'Order Placed' },
      confirmed: { variant: 'info', text: 'Confirmed' },
      out_for_delivery: { variant: 'primary', text: 'Out for Delivery' },
      delivered: { variant: 'success', text: 'Delivered' },
      cancelled: { variant: 'danger', text: 'Cancelled' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge bg={config.variant} className="fs-6">{config.text}</Badge>;
  };

  const getTrackingSteps = () => {
    const steps = [
      { id: 'pending', label: 'Order Placed', icon: '📝' },
      { id: 'confirmed', label: 'Confirmed', icon: '✅' },
      { id: 'out_for_delivery', label: 'Out for Delivery', icon: '🚚' },
      { id: 'delivered', label: 'Delivered', icon: '📦' }
    ];

    const statusOrder = ['pending', 'confirmed', 'out_for_delivery', 'delivered'];
    const currentIndex = statusOrder.indexOf(trackingInfo.status);

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex
    }));
  };

  const trackingSteps = getTrackingSteps();

  return (
    <div style={{ marginTop: '80px' }}>
      <Container>
        <Row>
          <Col md={8} className="mx-auto">
            <Card className="mb-4">
              <Card.Header className="text-center">
                <h4 className="mb-2">Track Your Order</h4>
                <p className="text-muted mb-0">Order ID: {orderId.slice(-8)}</p>
              </Card.Header>
              <Card.Body className="text-center">
                <div className="mb-3">
                  {getStatusBadge(trackingInfo.status)}
                </div>
                <p className="lead">
                  {trackingInfo.status === 'delivered' 
                    ? 'Your order has been delivered successfully!' 
                    : `Estimated delivery: ${trackingInfo.estimatedDelivery}`
                  }
                </p>
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Order Progress</h5>
              </Card.Header>
              <Card.Body>
                <div className="tracking-steps">
                  {trackingSteps.map((step, index) => (
                    <div 
                      key={step.id} 
                      className={`tracking-step ${step.completed ? 'completed' : ''} ${step.active ? 'active' : ''}`}
                    >
                      <div className="step-icon">
                        {step.icon}
                      </div>
                      <div className="step-label">
                        <strong>{step.label}</strong>
                      </div>
                      {index < trackingSteps.length - 1 && (
                        <div className={`step-line ${step.completed ? 'completed' : ''}`}></div>
                      )}
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>

            {trackingInfo.deliveryPartner && (
              <Card className="delivery-tracking">
                <Card.Header>
                  <h5 className="mb-0">Delivery Partner Details</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <p><strong>Name:</strong> {trackingInfo.deliveryPartner.name}</p>
                      <p><strong>Phone:</strong> {trackingInfo.deliveryPartner.phone}</p>
                    </Col>
                    <Col md={6}>
                      <p><strong>Vehicle:</strong> {trackingInfo.deliveryPartner.vehicleNumber}</p>
                      <p><strong>Status:</strong> 
                        <Badge bg="success" className="ms-2">On the way</Badge>
                      </p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            )}

            {!trackingInfo.deliveryPartner && trackingInfo.status === 'confirmed' && (
              <Alert variant="info" className="text-center">
                <h6>🔄 Finding delivery partner...</h6>
                <p className="mb-0">
                  We're assigning a delivery partner to your order. 
                  This usually takes 3-15 minutes depending on your order history.
                </p>
              </Alert>
            )}

            <Card className="mt-4">
              <Card.Header>
                <h5 className="mb-0">Order Summary</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <span><strong>Items:</strong></span>
                  <span>{order.items.length} items</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span><strong>Total Amount:</strong></span>
                  <span className="text-success fw-bold">₹{order.totalAmount}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span><strong>Delivery Address:</strong></span>
                  <span className="text-end">{order.userDetails.address}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span><strong>Order Date:</strong></span>
                  <span>{new Date(order.createdAt).toLocaleString()}</span>
                </div>
              </Card.Body>
            </Card>

            <div className="text-center mt-4">
              <p className="text-muted">
                📞 Need help? Contact us at <strong>+91 1234567890</strong>
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default OrderTrackingPage;