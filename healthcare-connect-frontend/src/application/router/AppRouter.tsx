import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginPage from '../../presentation/pages/LoginPage';
import AppointmentListPage from '../../presentation/pages/AppointmentListPage';
import Layout from '../../presentation/components/layout/Layout';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export const AppRouter = () => {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<Layout />}>
                <Route path="/appointments" element={
                    <PrivateRoute>
                        <AppointmentListPage />
                    </PrivateRoute>
                } />
                <Route />
            </Route>
        </Routes>
    );
};