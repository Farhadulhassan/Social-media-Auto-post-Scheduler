import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Request Interceptor: Attach JWT
        const requestInterceptor = axios.interceptors.request.use(
            (config) => {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const { token } = JSON.parse(storedUser);
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response Interceptor: Handle Global Errors
        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                const message = error.response?.data?.message || error.message || 'Something went wrong';

                // Don't toast for 404s on initial data fetch if handled locally
                if (error.response?.status === 401) {
                    toast.error('Session expired. Please login again.');
                    logout();
                } else if (error.response?.status === 403) {
                    toast.error(`Forbidden: ${message}`);
                }

                return Promise.reject(error);
            }
        );

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, []);

    const login = async (email, password) => {
        const { data } = await axios.post('http://localhost:3000/api/users/login', { email, password });
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        return data;
    };

    const updateUser = (updatedData) => {
        const newUser = { ...user, ...updatedData };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login';
    };

    const hasPermission = (permission) => {
        if (!user || !user.permissions) return false;
        return user.permissions.includes('*') || user.permissions.includes(permission);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, hasPermission, updateUser }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
