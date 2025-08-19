import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';
import LoadingSpinner from '../components/LoadingSpinner';

const CartPage = () => {
  const { items, totalAmount, loading } = useCart();
  const navigate = useNavigate();

  if (loading) {
    return <LoadingSpinner message="Loading cart..." />;
  }

  if (items.length === 0) {
    return (
      <div style={{ marginTop: '80px' }}>
        <Container>
          <div className="empty-state">
            <h2>Your cart is empty</h2>
            <p>Add some items to get started</p>
            <Link to="/">
              <Button variant="success" size="lg">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  const handleProceedToCheckout = () => {
    navigate('/order');
  };

  return (
    <div style={{ marginTop: '80px' }}>
      <Container>
        <Row>
          <Col md={8}>
            <Card className="mb-4">
              <Card.Header>
                <h4 className="mb-0">Shopping Cart ({items.length} items)</h4>
              </Card.Header>
              <Card.Body>
                {items.map(item => (
                  <CartItem key={item.productId._id} item={item} />
                ))}
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4}>
            <div className="total-section">
              <h5 className="mb-3">Order Summary</h5>
              
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>₹{totalAmount}</span>
              </div>
              
              <div className="d-flex justify-content-between mb-2">
                <span>Delivery Fee:</span>
                <span className="text-success">FREE</span>
              </div>
              
              <hr />
              
              <div className="d-flex justify-content-between mb-3">
                <strong>Total:</strong>
                <strong className="text-success">₹{totalAmount}</strong>
              </div>
              
              <div className="d-grid gap-2">
                <Button 
                  variant="success" 
                  size="lg"
                  onClick={handleProceedToCheckout}
                >
                  Proceed to Checkout
                </Button>
                
                <Link to="/">
                  <Button variant="outline-success" className="w-100">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
              
              <div className="mt-3 text-center">
                <small className="text-muted">
                  🚚 Free delivery on all orders
                </small>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CartPage;