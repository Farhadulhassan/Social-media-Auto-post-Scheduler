import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Schedulers from './pages/Schedulers';
import UserManagement from './pages/UserManagement';
import RolesPermissions from './pages/RolesPermissions';
import Settings from './pages/Settings';
import PostManager from './pages/PostManager';

import Login from './pages/Login';
import Register from './pages/Register';





const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    return <DashboardLayout>{children}</DashboardLayout>;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App font-outfit">
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route
                            path="/*"
                            element={
                                <ProtectedRoute>
                                    <Routes>
                                        <Route path="/" element={<Dashboard />} />
                                        <Route path="/schedulers" element={<Schedulers />} />
                                        <Route path="/admin/users" element={<UserManagement />} />
                                        <Route path="/admin/roles" element={<RolesPermissions />} />
                                        <Route path="/settings" element={<Settings />} />
                                        <Route path="/schedulers/:id/posts" element={<PostManager />} />


                                    </Routes>
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                    <Toaster position="top-right" />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
