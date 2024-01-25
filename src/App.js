// Import necessary libraries and components
import React from 'react';
import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { AuthProvider } from './AuthContext';
import PrivateRoute from './PrivateRoute';
import HomePage from './Pages/Homepage/homepage';
import BookingPage from './Pages/Bookingpage/bookingpage';
import SignUp from './Pages/Signup/frontendSup';
import LoginPage from './Pages/login/frontendLin';
import PaymentPage from './Pages/BookingDetailpage/bookingdetail';

// Initialize Stripe outside of the component
const stripePromise = loadStripe('pk_test_51Nryh0JD5tRixJhxaazlRnG4EoK0PRdvsCnwhY9o8joJE6dCtEv19Vx2Ut6UvfJ0MYta2XHomA7iPmlZz83G23c200B5MAldmd');

// Define your routes in a function using useRoutes hook
const Routes = () => {
  return useRoutes([
    { path: "/", element: <LoginPage /> },
    { path: "/login", element: <LoginPage /> },
    { 
      path: "/homepage", 
      element: (
        <PrivateRoute>
          <HomePage />
        </PrivateRoute>
      ) 
    },
    { 
      path: "/bookingpage", 
      element: (
        <PrivateRoute>
          <BookingPage />
        </PrivateRoute>
      ) 
    },
    { 
      path: "/payment", 
      element: (
        <PrivateRoute>
          <Elements stripe={stripePromise}>
            <PaymentPage />
          </Elements>
        </PrivateRoute>
      ) 
    },
    { path: "/signup", element: <SignUp /> },
    // Define other routes as needed
  ]);
};

// Main App component that provides the Auth context and sets up the Router
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes />
      </Router>
    </AuthProvider>
  );
};

export default App;
