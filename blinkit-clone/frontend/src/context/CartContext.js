import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { cartAPI } from '../services/api';
import { toast } from 'react-toastify';

const CartContext = createContext();

// Generate a simple user ID for demo purposes
const getUserId = () => {
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('userId', userId);
  }
  return userId;
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_CART':
      return { 
        ...state, 
        items: action.payload.items || [], 
        totalAmount: action.payload.totalAmount || 0,
        loading: false 
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_CART':
      return { ...state, items: [], totalAmount: 0 };
    default:
      return state;
  }
};

const initialState = {
  items: [],
  totalAmount: 0,
  loading: false,
  error: null,
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const userId = getUserId();

  // Load cart on mount
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await cartAPI.get(userId);
      dispatch({ type: 'SET_CART', payload: response.data });
    } catch (error) {
      console.error('Error loading cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load cart' });
    }
  };

  const addToCart = async (product, quantity = 1) => {
    try {
      const response = await cartAPI.addItem({
        userId,
        productId: product._id,
        quantity,
      });
      dispatch({ type: 'SET_CART', payload: response.data });
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const updateCartItem = async (productId, quantity) => {
    try {
      const response = await cartAPI.updateItem({
        userId,
        productId,
        quantity,
      });
      dispatch({ type: 'SET_CART', payload: response.data });
    } catch (error) {
      console.error('Error updating cart item:', error);
      toast.error('Failed to update cart item');
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await cartAPI.removeItem({
        userId,
        productId,
      });
      dispatch({ type: 'SET_CART', payload: response.data });
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item from cart');
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clear(userId);
      dispatch({ type: 'CLEAR_CART' });
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  const getCartItemCount = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    ...state,
    userId,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    loadCart,
    getCartItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};