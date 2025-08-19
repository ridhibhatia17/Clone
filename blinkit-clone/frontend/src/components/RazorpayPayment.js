import React, { useState } from 'react';
import { Button, Alert, Spinner } from 'react-bootstrap';
import { paymentAPI } from '../services/api';
import { toast } from 'react-toastify';

const RazorpayPayment = ({ orderId, onSuccess, onError, amount, razorpayKeyId }) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setProcessing(true);
    setError(null);

    try {
      // Ensure Razorpay script is loaded
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error('Failed to load Razorpay SDK. Check your internet connection.');
      }

      // 1. Create Razorpay Order from backend
      const { data } = await paymentAPI.createRazorpayOrder({ orderId });

      // 2. Configure Razorpay options
      const options = {
        key: razorpayKeyId,
        amount: data.amount,
        currency: data.currency,
        name: 'Blinkit Clone',
        description: 'Test Transaction',
        order_id: data.razorpayOrderId,
        handler: async function (response) {
          try {
            // 3. Verify payment on backend
            const verifyResponse = await paymentAPI.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
            });

            if (verifyResponse.data.success) {
              toast.success('Payment successful!');
              onSuccess(verifyResponse.data);
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (err) {
            const errorMessage =
              err.response?.data?.message || err.message || 'Payment verification failed';
            setError(errorMessage);
            onError(errorMessage);
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name: 'Customer Name',
          email: 'customer@example.com',
          contact: '9999999999',
        },
        notes: {
          orderId,
        },
        theme: {
          color: '#3399cc',
        },
      };

      // 4. Open Razorpay Checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Payment initiation failed';
      console.error('Razorpay payment error:', err);
      setError(errorMessage);
      onError(errorMessage);
      setProcessing(false);
    }
  };

  return (
    <div>
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}

      <Button
        onClick={handlePayment}
        variant="primary"
        size="lg"
        className="w-100"
        disabled={processing}
      >
        {processing ? (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
              className="me-2"
            />
            Processing...
          </>
        ) : (
          `Pay ₹${amount} with Razorpay`
        )}
      </Button>

      <div className="text-center mt-2">
        <small className="text-muted">🔒 Secured by Razorpay</small>
      </div>
    </div>
  );
};

export default RazorpayPayment;
