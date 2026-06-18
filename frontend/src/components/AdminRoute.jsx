import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return (
        <div className="min-h-screen bg-[#091426] flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-[#00adef] border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'admin') return <Navigate to="/" replace />;

    return children;
};

export default AdminRoute;
