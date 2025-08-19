import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-spinner">
      <div className="text-center">
        <Spinner animation="border" variant="success" />
        <div className="mt-2">{message}</div>
      </div>
    </div>
  );
};

export default LoadingSpinner;