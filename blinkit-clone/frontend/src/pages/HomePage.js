import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, ButtonGroup } from 'react-bootstrap';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll();
      const productsData = response.data;
      
      setProducts(productsData);
      setFilteredProducts(productsData);
      
      // Extract unique categories
      const uniqueCategories = ['All', ...new Set(productsData.map(product => product.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterByCategory = (category) => {
    setSelectedCategory(category);
    if (category === 'All') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(product => product.category === category));
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading products..." />;
  }

  return (
    <div style={{ marginTop: '80px' }}>
      <Container>
        <div className="text-center py-4">
          <h1 className="display-4 fw-bold text-success">Welcome to Blinkit Clone</h1>
          <p className="lead">Fresh groceries delivered in minutes</p>
        </div>

        {/* Category Filter */}
        <div className="category-filter mb-4">
          <h5 className="mb-3">Categories</h5>
          <ButtonGroup className="flex-wrap">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'success' : 'outline-success'}
                onClick={() => filterByCategory(category)}
                className="category-btn"
              >
                {category}
              </Button>
            ))}
          </ButtonGroup>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <h4>No products found</h4>
            <p>Try selecting a different category</p>
          </div>
        ) : (
          <Row xs={2} md={3} lg={4} className="g-4">
            {filteredProducts.map(product => (
              <Col key={product._id}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
};

export default HomePage;