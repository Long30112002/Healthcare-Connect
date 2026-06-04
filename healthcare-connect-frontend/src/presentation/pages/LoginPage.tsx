import React, { useEffect, useState } from 'react';
import { authApi } from '../../infrastructure/api/authApi';
import { useAuth } from '../../application/context/AuthContext';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppTranslation } from '../../application/hooks/useAppTranslation';
import LanguageToggle from '../components/shared/LanguageToggle';
import toast from 'react-hot-toast';
import { useMinLoadingAction } from '../../application/hooks/useMinLoadingAction';
import type { LoginResponse } from '../../core/types/api.response';
import Logo from '../components/shared/Logo';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const { t, getError } = useAppTranslation();
    const [searchParams] = useSearchParams();
    const [isDemoExpanded, setIsDemoExpanded] = useState(false);
    const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

    const handleCopy = (email: string, password: string) => {
        navigator.clipboard.writeText(`${email}\n${password}`);
        setCopiedEmail(email);
        setTimeout(() => setCopiedEmail(null), 2000);
        toast.success('Đã copy thông tin đăng nhập!');
    };

    const demoAccounts = [
        { role: '👑 ADMIN', email: 'admin@healthcare.com', password: 'password123', color: 'purple' },
        { role: '🏥 HOSPITAL_MANAGER', email: 'manager.xuyena@hospital.com', password: 'password123', color: 'blue' },
        { role: '👨‍⚕️ DOCTOR', email: 'doctor_1_3484@hospital.com', password: 'password123', color: 'green' },
        { role: '📋 RECEPTIONIST', email: 'reception.xuyena1@hospital.com', password: 'password123', color: 'orange' },
        { role: '👤 PATIENT', email: 'patient1@demo.com', password: 'password123', color: 'teal' },
    ];

    useEffect(() => {
        const verified = searchParams.get('verified');
        const error = searchParams.get('error');

        if (verified === 'true') {
            toast.success(t('verify.success'));
            window.history.replaceState({}, '', '/login');
        }

        if (error === 'already_verified') {
            toast.success(t('verify.alreadyVerified'));
            window.history.replaceState({}, '', '/login');
        }

        if (error === 'expired_code') {
            toast.error(t('verify.expired'));
            window.history.replaceState({}, '', '/register');
        }
    }, [searchParams, t]);

    const { execute: handleLogin, loading } = useMinLoadingAction<LoginResponse>({
        minLoadingTime: 1000,
        errorMessage: (error) => {
            const errorKey = error.response?.data?.errorKey;
            if (errorKey) {
                return getError(errorKey);
            }
            return error.response?.data?.message || t('toast.login_failed');
        },
        onSuccess: (loginData) => {
            if (loginData?.authenticated && loginData?.user) {
                login(loginData.user);
                navigate('/dashboard', { replace: true });
            }
        },
    });

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.error(t('error.EMAIL_REQUIRED'));
            return;
        }

        if (!password) {
            toast.error(t('error.PASSWORD_REQUIRED'));
            return;
        }

        await handleLogin(() => authApi.login({ email, password }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-700 to-cyan-500 p-4 relative">
            <div className="absolute top-4 right-4 z-20">
                <LanguageToggle variant="auto" />
            </div>

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat',
                }} />
            </div>

            {/* Animated Floating Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -left-20 w-96 h-96 bg-white rounded-full opacity-10 animate-float-slow"></div>
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-white rounded-full opacity-10 animate-float-delay"></div>
                <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-cyan-300 rounded-full opacity-10 animate-float-fast"></div>
                <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-blue-300 rounded-full opacity-10 animate-float-slow"></div>
            </div>

            {/* Medical Icons Floating*/}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 text-white opacity-65 text-6xl animate-bounce-slow">🏥</div>
                <div className="absolute bottom-32 right-16 text-white opacity-65 text-6xl animate-pulse-slow">💊</div>
                <div className="absolute top-1/2 right-20 text-white opacity-65 text-6xl animate-spin-slow">🩺</div>
                <div className="absolute bottom-20 left-1/4 text-white opacity-65 text-6xl animate-float-slow">🚑</div>
                <div className="absolute top-40 right-1/3 text-white opacity-65 text-6xl animate-bounce-slow">❤️</div>
            </div>

            {/* Sticky Note - Desktop (right side) */}
            <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-30 hidden md:block">
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30 border border-yellow-200 dark:border-yellow-800 rounded-xl shadow-2xl backdrop-blur-md w-72 overflow-hidden transition-all duration-300">
                    <div
                        className="flex items-center justify-between p-3 cursor-pointer hover:bg-yellow-100/50 dark:hover:bg-yellow-800/30"
                        onClick={() => setIsDemoExpanded(!isDemoExpanded)}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-lg">📋</span>
                            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">Tài khoản Demo</h4>
                            {!isDemoExpanded && (
                                <span className="text-xs bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-2 py-0.5 rounded-full">
                                    {demoAccounts.length}
                                </span>
                            )}
                        </div>
                        <svg className={`w-4 h-4 transition-transform duration-300 text-gray-600 dark:text-gray-300 ${isDemoExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>

                    {isDemoExpanded && (
                        <div className="p-3 pt-0 border-t border-yellow-200 dark:border-yellow-800">
                            <div className="grid grid-cols-1 gap-2 mt-2 max-h-96 overflow-y-auto">
                                {demoAccounts.map((acc, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => handleCopy(acc.email, acc.password)}
                                        className={`bg-white/70 dark:bg-gray-800/70 rounded-lg p-2 cursor-pointer transition-all hover:scale-102 hover:shadow-md border-l-4 border-${acc.color}-500`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className={`text-xs font-bold text-${acc.color}-600 dark:text-${acc.color}-400`}>
                                                {acc.role}
                                            </span>
                                            {copiedEmail === acc.email && (
                                                <span className="text-[10px] text-green-600">✓ Copied!</span>
                                            )}
                                        </div>
                                        <div className="text-xs font-mono text-gray-700 dark:text-gray-300 truncate">
                                            {acc.email}
                                        </div>
                                        <div className="text-[10px] text-gray-500 dark:text-gray-400">
                                            {acc.password}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 text-center">
                                💡 Click vào ô để copy
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Floating button - Mobile (bottom right) */}
            <div className="fixed bottom-20 right-4 z-30 md:hidden">
                {isDemoExpanded ? (
                    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30 border border-yellow-200 dark:border-yellow-800 rounded-xl shadow-2xl backdrop-blur-md w-80 mb-2">
                        <div className="flex justify-between items-center p-3 border-b border-yellow-200 dark:border-yellow-800">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">📋</span>
                                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">Tài khoản Demo</h4>
                            </div>
                            <button
                                onClick={() => setIsDemoExpanded(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-3 max-h-80 overflow-y-auto">
                            <div className="grid grid-cols-1 gap-2">
                                {demoAccounts.map((acc, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => handleCopy(acc.email, acc.password)}
                                        className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-2 cursor-pointer hover:bg-white/90 dark:hover:bg-gray-800/90 transition border-l-4"
                                        style={{ borderLeftColor: `var(--color-${acc.color})` }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold" style={{ color: `var(--color-${acc.color})` }}>
                                                {acc.role}
                                            </span>
                                            {copiedEmail === acc.email && (
                                                <span className="text-[10px] text-green-600">✓</span>
                                            )}
                                        </div>
                                        <div className="text-xs font-mono text-gray-700 dark:text-gray-300 truncate">
                                            {acc.email}
                                        </div>
                                        <div className="text-[10px] text-gray-500 dark:text-gray-400">
                                            {acc.password}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 text-center">
                                💡 Mật khẩu: password123
                            </p>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsDemoExpanded(true)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full p-3 shadow-lg transition-all hover:scale-105 active:scale-95"
                        title="Tài khoản demo"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 01.586 1.414V19a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Main Form Container */}
            <div className="relative z-10 w-full max-w-md">
                <div className="text-center mb-8">
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-3xl shadow-2xl mb-6 animate-fade-in hover:scale-105 transition-transform duration-300"
                    >
                        <Logo className="w-14 h-14 object-contain" />
                    </Link>
                    <h2 className="text-4xl font-bold text-white mb-2 animate-slide-up">
                        {t('page.login.title')}
                    </h2>
                    <p className="text-blue-100 text-lg animate-slide-up">
                        {t('page.login.subtitle')}
                    </p>
                </div>

                <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 animate-fade-in transition-colors duration-300">
                    <form onSubmit={onSubmit} className="space-y-5">
                        <Input
                            label={t('common.email')}
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            size="lg"
                            rounded="lg"
                            icon={
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                </svg>
                            }
                        />

                        <Input
                            label={t('common.password')}
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            size="lg"
                            rounded="lg"
                            icon={
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            }
                            rightElement={
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="hover:opacity-70 transition p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    {showPassword ? (
                                        <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            }
                        />

                        <div className="flex items-center justify-between">
                            <label className="flex items-center cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 text-primary rounded border-gray-300 dark:border-gray-600 focus:ring-primary dark:bg-gray-700" />
                                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition">
                                    {t('page.login.rememberMe')}
                                </span>
                            </label>
                            <Link to="/forgot-password" className="text-sm text-primary hover:text-blue-700 font-medium">
                                {t('page.login.forgotPassword')}
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            rounded="lg"
                            fullWidth
                            loading={loading}
                        >
                            {t('common.login').toUpperCase()}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t('page.login.noAccount')}{' '}
                            <Link to="/register" className="text-primary hover:text-blue-700 font-medium">
                                {t('page.login.signUp')}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(10deg); }
                }
                @keyframes float-fast {
                    0%, 100% { transform: translateY(0px) translateX(0px); }
                    50% { transform: translateY(-30px) translateX(20px); }
                }
                @keyframes float-delay {
                    0%, 100% { transform: translateY(0px) scale(1); }
                    50% { transform: translateY(-40px) scale(1.1); }
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-15px); }
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.15; transform: scale(1); }
                    50% { opacity: 0.25; transform: scale(1.1); }
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
                .animate-float-fast { animation: float-fast 4s ease-in-out infinite; }
                .animate-float-delay { animation: float-delay 8s ease-in-out infinite; }
                .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
                .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
                .animate-spin-slow { animation: spin-slow 12s linear infinite; }
                .animate-slide-up { animation: slide-up 0.6s ease-out; }
                .animate-fade-in { animation: fade-in 0.5s ease-out; }
                .hover\:scale-102:hover { transform: scale(1.02); transition: transform 0.2s ease; }
            `}</style>
        </div>
    );
};

export default LoginPage;