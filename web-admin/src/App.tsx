// web-admin/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout Components
import AuthLayout from './components/layout/AuthLayout';
import MainLayout from './components/layout/MainLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Protected Pages  
import DashboardPage from './pages/dashboard/DashboardPage';
import ExpensesPage from './pages/expenses/ExpensesPage';
import ExpenseDetailPage from './pages/expenses/ExpenseDetailPage';
import UsersPage from './pages/users/UsersPage';
import UserDetailPage from './pages/users/UserDetailPage';
import MessagesPage from './pages/messages/MessagesPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import SettingsPage from './pages/settings/SettingsPage';
import ProfilePage from './pages/profile/ProfilePage';

// Guards
import AuthGuard from './components/guards/AuthGuard';
import RoleGuard from './components/guards/RoleGuard';

// Store
import { useAuthStore } from './store/authStore';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Public Routes (Auth) */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route index element={<Navigate to="/auth/login" replace />} />
          </Route>

          {/* Protected Routes */}
          <Route 
            path="/*" 
            element={
              <AuthGuard>
                <MainLayout />
              </AuthGuard>
            }
          >
            {/* Dashboard */}
            <Route path="dashboard" element={<DashboardPage />} />
            
            {/* Expenses */}
            <Route path="expenses" element={<ExpensesPage />} />
            <Route path="expenses/:id" element={<ExpenseDetailPage />} />
            
            {/* Users - Admin/Gestor only */}
            <Route 
              path="users" 
              element={
                <RoleGuard allowedRoles={['admin', 'gestor']}>
                  <UsersPage />
                </RoleGuard>
              } 
            />
            <Route 
              path="users/:id" 
              element={
                <RoleGuard allowedRoles={['admin', 'gestor']}>
                  <UserDetailPage />
                </RoleGuard>
              } 
            />
            
            {/* Messages */}
            <Route path="messages" element={<MessagesPage />} />
            
            {/* Notifications */}
            <Route path="notifications" element={<NotificationsPage />} />
            
            {/* Settings - Admin only */}
            <Route 
              path="settings" 
              element={
                <RoleGuard allowedRoles={['admin']}>
                  <SettingsPage />
                </RoleGuard>
              } 
            />
            
            {/* Profile */}
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>

        {/* Global Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1F2937',
              color: '#F9FAFB',
            },
            success: {
              style: {
                background: '#10B981',
              },
            },
            error: {
              style: {
                background: '#EF4444',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;