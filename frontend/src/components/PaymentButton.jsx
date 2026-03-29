import React, { useState } from 'react';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axios';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';

const PaymentButton = ({ venueId, selectedDate, selectedSlot, amount }) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBookingClick = async () => {
    if (!user) {
      toast.error('Please login to book a slot');
      navigate('/login');
      return;
    }

    setLoading(true);
    const scriptLoaded = await loadRazorpayScript();
    
    if (!scriptLoaded) {
      toast.error('Failed to load Razorpay SDK. Check your connection.');
      setLoading(false);
      return;
    }

    try {
      // 1. Create Order
      const { data } = await axiosInstance.post('/api/owners/bookings/create', {
        userId: user.id || user.email,
        venueId: parseInt(venueId),
        bookingDate: selectedDate,
        timeSlot: selectedSlot,
        amount: amount
      });

      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SOigKGyllIr3HN',
        amount: data.amount, 
        currency: 'INR',
        name: 'Playo Clone',
        description: `Booking for ${selectedDate} at ${selectedSlot}`,
        order_id: data.orderId || data.razorpayOrderId, 
        handler: async function (response) {
          try {
            // 3. Verify Payment
            await axiosInstance.post('/api/owners/bookings/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            
            toast.success("Booking Confirmed! 🎉");
            // Navigate to profile or bookings page
            navigate("/myprofile");
          } catch (err) {
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: user.name || "Test User",
          email: user.email || "test@example.com",
          contact: user.phone || "9999999999"
        },
        theme: {
          color: "#10B981"
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to initiate booking. Slot might be taken.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleBookingClick} 
      disabled={loading || !selectedDate || !selectedSlot}
      className={`w-full py-4 text-lg rounded-xl font-bold text-white transition-all
        ${(loading || !selectedDate || !selectedSlot) ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-green-500/30'}`}
    >
      {loading ? 'Processing...' : `Book Slot - ₹${amount}`}
    </button>
  );
};

export default PaymentButton;
