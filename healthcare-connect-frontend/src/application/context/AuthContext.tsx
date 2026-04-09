import { createContext, type ReactNode, useState, useEffect, useContext } from "react";
import type { User } from "../../core/types";
import { authApi } from "../../infrastructure/api/authApi";
import { useLocation, useNavigate } from 'react-router-dom';

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
                const res = await authApi.getMyInfo();
                setUser(res.data.data);
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
        } finally {
            setUser(null);
            navigate('/');
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                login,
                logout,
                loading
            }}>
            {loading ? (
                <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900">
                    <div className="text-center animate-fade-in">
                        <h1 className="text-4xl font-bold text-primary mb-2">Healthcare Connect</h1>
                        <div className="flex justify-center gap-1">
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        </div>
                    </div>
                </div>
            ) : children}

        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};