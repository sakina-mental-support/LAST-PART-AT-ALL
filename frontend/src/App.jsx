import React from 'react';
import SystemHealthBanner from './components/SystemHealthBanner';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/MainLayout';
import Register from './components/Register';
import Login from './components/Login';
import ChatPage from './components/ChatPage';
import Profile from './components/Profile';
import AdminDashboard from './components/AdminDashboard';
import Home from './components/Home';
import RecoveryJourney from './components/RecoveryJourney';
import InterventionDetail from './components/InterventionDetail';
import MoodTracker from './components/MoodTracker';
import MusicTherapy from './components/MusicTherapy';
import Journal from './components/Journal';
import TherapySession from './components/TherapySession';
import RiskAssessment from './components/RiskAssessment';
import ForgotPassword from './components/ForgotPassword';
import CheckEmail from './components/CheckEmail';
import BackToSafe from './components/BackToSafe';
import Onboarding from './components/Onboarding';
import DevKit from './components/DevKit';
import { EmotionalOSProvider } from './context/EmotionalOSContext.jsx';
import ScrollToTop from './components/ScrollToTop';
import AdaptiveUIProvider from './components/AdaptiveUIProvider';

const App = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <EmotionalOSProvider>
          <AdaptiveUIProvider>
            <SystemHealthBanner />
            <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/check-email" element={<CheckEmail />} />

            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoute><MainLayout><Home /></MainLayout></ProtectedRoute>} />
            <Route path="/exercises" element={<ProtectedRoute><MainLayout><RecoveryJourney /></MainLayout></ProtectedRoute>} />
            <Route path="/back-to-safe" element={<ProtectedRoute><BackToSafe /></ProtectedRoute>} />
            <Route path="/intervention-detail" element={<ProtectedRoute><MainLayout><InterventionDetail /></MainLayout></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><MainLayout><ChatPage /></MainLayout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><MainLayout><AdminDashboard /></MainLayout></AdminRoute>} />
            <Route path="/mood" element={<ProtectedRoute><MainLayout><MoodTracker /></MainLayout></ProtectedRoute>} />
            <Route path="/music" element={<ProtectedRoute><MainLayout><MusicTherapy /></MainLayout></ProtectedRoute>} />
            <Route path="/journal" element={<ProtectedRoute><MainLayout><Journal /></MainLayout></ProtectedRoute>} />
            <Route path="/therapy" element={<ProtectedRoute><MainLayout><TherapySession /></MainLayout></ProtectedRoute>} />
            <Route path="/risk-assessment" element={<ProtectedRoute><MainLayout><RiskAssessment /></MainLayout></ProtectedRoute>} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/devkit" element={<ProtectedRoute><DevKit /></ProtectedRoute>} />
            </Routes>
          </AdaptiveUIProvider>
        </EmotionalOSProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;