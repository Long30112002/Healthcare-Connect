import { createContext, type ReactNode, useState, useEffect, useContext } from "react";
import type { User } from "../../core/types";
import { authApi } from "../../infrastructure/api/authApi";
import { useLocation, useNavigate } from 'react-router-dom';
import LoadingSpinner from "../../presentation/components/shared/LoadingSpinner";

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (userData: User) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const initAuth = async () => {
            try {
                const userData = await authApi.getMyInfo();
                setUser(userData);
                if (location.pathname === '/login') navigate('/');
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);


    const login = (userData: User) => {
        setUser(userData);
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            setUser(null);
            navigate('/', { replace: true });
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, loading }}>
            {loading ? (
                <LoadingSpinner
                    fullScreen
                    variant="dots"
                    text="Healthcare Connect"
                />
            ) : (
                children
            )}
        </AuthContext.Provider>
    )
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};