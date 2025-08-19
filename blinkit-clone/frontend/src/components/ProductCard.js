import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart, items } = useCart();

  const getCartQuantity = () => {
    const cartItem = items.find(item => item.productId._id === product._id);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  return (
    <Card className="product-card h-100">
      <Card.Img 
        variant="top" 
        src={product.image} 
        alt={product.name}
        className="product-image"
      />
      <Card.Body className="d-flex flex-column">
        <Card.Title className="fs-6">{product.name}</Card.Title>
        <Card.Text className="text-muted small mb-2">
          {product.description}
        </Card.Text>
        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-bold text-success">₹{product.price}</span>
            <small className="text-muted">{product.category}</small>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <Button 
              variant="success" 
              size="sm" 
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="flex-grow-1"
            >
              {product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
            {getCartQuantity() > 0 && (
              <span className="ms-2 badge bg-success">
                {getCartQuantity()}
              </span>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;