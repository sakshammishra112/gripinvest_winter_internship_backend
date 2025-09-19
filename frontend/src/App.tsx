import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Investments from './pages/Investments';
import TransactionLogs from './pages/TransactionLogs';
import Profile from './pages/Profile';
import LoadingSpinner from './components/ui/LoadingSpinner';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import StocksNews from './pages/StocksNews';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navbar />}
      <Routes>
        <Route 
          path="/login" element={<LoginPage />} 
        />
        <Route 
          path="/signup" element={<SignupPage />} 
        />
        <Route 
          path="/" 
          element={user ? <Navigate to="/dashboard" /> : <LandingPage />} 
        />
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard /> : <Navigate to="/" />} 
        />
        <Route 
          path="/products" 
          element={user ? <Products /> : <Navigate to="/ProductDetail" />} 
        />
        <Route 
          path="/products/:id" 
          element={user ? <ProductDetail /> : <Navigate to="/" />} 
        />
        <Route 
          path="/investments" 
          element={user ? <Investments /> : <Navigate to="/" />} 
        />
        <Route 
          path="/logs" 
          element={user ? <TransactionLogs /> : <Navigate to="/" />} 
        />
        <Route 
          path="/profile" 
          element={user ? <Profile /> : <Navigate to="/" />} 
        />
        <Route 
          path="/stocks-news" 
          element={user ? <StocksNews /> : <Navigate to="/" />} 
        />
      </Routes>
    </div>
  );
}

export default App;