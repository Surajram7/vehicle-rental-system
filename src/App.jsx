import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages - Auth
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Layout
import MainLayout from './components/Layout/MainLayout';

// Pages - Customer
import HomePage from './pages/Customer/HomePage';
import VehicleGrid from './pages/Customer/VehicleGrid';
import VehicleDetails from './pages/Customer/VehicleDetails';
import BookingsList from './pages/Customer/BookingsList';
import MyVehicles from './pages/Customer/MyVehicles';
import ReceivedBookings from './pages/Customer/ReceivedBookings';
import MyProfile from './pages/Customer/MyProfile';
import PaymentPage from './pages/Customer/PaymentPage';
import Support from './pages/Customer/Support';

// Pages - Admin
import Dashboard from './pages/Admin/Dashboard';
import VehicleManager from './pages/Admin/VehicleManager';
import BookingManager from './pages/Admin/BookingManager';
import UserManager from './pages/Admin/UserManager';
import AuditLogs from './pages/Admin/AuditLogs';
import TicketManager from './pages/Admin/TicketManager';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

const App = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />

      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        {/* Customer Routes */}
        <Route index element={
          user?.role === 'admin' ? <Navigate to="/dashboard" /> : <HomePage />
        } />
        <Route path="vehicles" element={
          <ProtectedRoute allowedRoles={['user']}>
            <VehicleGrid />
          </ProtectedRoute>
        } />
        <Route path="vehicle/:id" element={
          <ProtectedRoute allowedRoles={['user']}>
            <VehicleDetails />
          </ProtectedRoute>
        } />
        <Route path="my-bookings" element={
          <ProtectedRoute allowedRoles={['user']}>
            <BookingsList />
          </ProtectedRoute>
        } />
        <Route path="my-vehicles" element={
          <ProtectedRoute allowedRoles={['user']}>
            <MyVehicles />
          </ProtectedRoute>
        } />
        <Route path="received-bookings" element={
          <ProtectedRoute allowedRoles={['user']}>
            <ReceivedBookings />
          </ProtectedRoute>
        } />
        <Route path="profile" element={
          <ProtectedRoute>
            <MyProfile />
          </ProtectedRoute>
        } />
        <Route path="payment" element={
          <ProtectedRoute allowedRoles={['user']}>
            <PaymentPage />
          </ProtectedRoute>
        } />
        <Route path="support" element={
          <ProtectedRoute>
            <Support />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="manage-vehicles" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <VehicleManager />
          </ProtectedRoute>
        } />
        <Route path="manage-bookings" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <BookingManager />
          </ProtectedRoute>
        } />
        <Route path="manage-users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UserManager />
          </ProtectedRoute>
        } />
        <Route path="audit-logs" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AuditLogs />
          </ProtectedRoute>
        } />
        <Route path="manage-tickets" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <TicketManager />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
};

export default App;
