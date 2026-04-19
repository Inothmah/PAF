import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import ProtectedRoute from './components/ProtectedRoute'
import ResourceCatalogue from './pages/ResourceCatalogue'
import ResourceManagement from './pages/ResourceManagement'
import BookingManagement from './pages/BookingManagement'
import AdminBookingManagement from './pages/AdminBookingManagement'
import UserTicketManagement from './pages/UserTicketManagement'
import AdminTicketManagement from './pages/AdminTicketManagement'
import Notifications from './pages/Notifications'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-indigo-500/30">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute />} />
          
          {/* User Routes */}
          <Route path="/resources" element={<ProtectedRoute><ResourceCatalogue /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><BookingManagement /></ProtectedRoute>} />
          <Route path="/my-tickets" element={<ProtectedRoute><UserTicketManagement /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin/resources" element={<ProtectedRoute requiredRole="ADMIN"><ResourceManagement /></ProtectedRoute>} />
          <Route path="/admin/bookings" element={<ProtectedRoute requiredRole="ADMIN"><AdminBookingManagement /></ProtectedRoute>} />
          <Route path="/admin/tickets" element={<ProtectedRoute requiredRole="ADMIN"><AdminTicketManagement /></ProtectedRoute>} />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
