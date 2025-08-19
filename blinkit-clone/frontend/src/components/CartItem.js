import React from 'react';
import { Row, Col, Button, Image } from 'react-bootstrap';
import { useCart } from '../context/CartContext';

const CartItem = ({ item }) => {
  const { updateCartItem, removeFromCart } = useCart();

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(item.productId._id);
    } else {
      updateCartItem(item.productId._id, newQuantity);
    }
  };

  const handleRemove = () => {
    removeFromCart(item.productId._id);
  };

  return (
    <div className="cart-item">
      <Row className="align-items-center">
        <Col xs={3} md={2}>
          <Image 
            src={item.productId.image} 
            alt={item.productId.name}
            fluid
            rounded
            style={{ height: '80px', objectFit: 'cover' }}
          />
        </Col>
        <Col xs={9} md={4}>
          <h6 className="mb-1">{item.productId.name}</h6>
          <small className="text-muted">{item.productId.description}</small>
        </Col>
        <Col xs={6} md={2} className="text-center">
          <div className="quantity-controls">
            <button 
              className="quantity-btn"
              onClick={() => handleQuantityChange(item.quantity - 1)}
            >
              -
            </button>
            <span className="mx-2 fw-bold">{item.quantity}</span>
            <button 
              className="quantity-btn"
              onClick={() => handleQuantityChange(item.quantity + 1)}
            >
              +
            </button>
          </div>
        </Col>
        <Col xs={3} md={2} className="text-center">
          <div className="fw-bold">₹{item.price}</div>
        </Col>
        <Col xs={3} md={2} className="text-center">
          <div className="fw-bold text-success">₹{item.price * item.quantity}</div>
          <Button 
            variant="outline-danger" 
            size="sm" 
            onClick={handleRemove}
            className="mt-1"
          >
            Remove
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default CartItem;