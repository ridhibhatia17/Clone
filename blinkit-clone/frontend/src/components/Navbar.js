import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Badge, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { getCartItemCount } = useCart();
  const cartItemCount = getCartItemCount();

  return (
    <BootstrapNavbar bg="white" expand="lg" className="border-bottom" fixed="top">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/" className="fw-bold">
          🛒 Blinkit Clone
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/">
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/cart" className="position-relative">
              Cart
              {cartItemCount > 0 && (
                <Badge 
                  bg="success" 
                  pill 
                  className="position-absolute top-0 start-100 translate-middle"
                  style={{ fontSize: '0.7rem' }}
                >
                  {cartItemCount}
                </Badge>
              )}
            </Nav.Link>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;