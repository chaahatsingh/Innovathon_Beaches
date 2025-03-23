import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Benefits from './components/Benefits';
import Collaboration from './components/Collaboration';
import Services from './components/Services';
import Pricing from './components/Pricing';
import Roadmap from './components/Roadmap';
import Footer from './components/Footer';
import ButtonGradient from './assets/svg/ButtonGradient';
import Login from './pages/login';
import Signup from './pages/signup';
import Dashboard from './pages/dashboard/Dashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';

// Protected Route Component
const ProtectedRoute = ({ children, allowedUserType }) => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (allowedUserType && currentUser.userType !== allowedUserType) {
    return <Navigate to="/" />;
  }

  return children;
};

const App = () => {
  const location = useLocation();
  const isDashboard = ['/dashboard', '/admin-dashboard'].includes(location.pathname);

  return (
    <div className={isDashboard ? 'dark' : ''}>
      {!isDashboard && <Header />}
      <Routes>
        <Route path="/" element={
          <>
            <Hero />
            <Benefits />
            <Collaboration />
            <Services />
            <Pricing />
            <Roadmap />
          </>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedUserType="employee">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedUserType="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
      {!isDashboard && <Footer />}
      {!isDashboard && <ButtonGradient />}
    </div>
  );
};

export default App;
