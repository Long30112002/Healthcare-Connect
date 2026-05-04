import { useState } from 'react';
import { useAppTranslation } from '../../application/hooks/useAppTranslation';
import { useMinLoadingAction } from '../../application/hooks/useMinLoadingAction';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';
import toast from 'react-hot-toast';
import { useAuth } from '../../application/context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ContactFormData {
    fullName: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
}

const ContactPage = () => {
    const { t } = useAppTranslation();
    const [formData, setFormData] = useState<ContactFormData>({
        fullName: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const handleChange = (field: keyof ContactFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateForm = (): boolean => {
        if (!formData.fullName.trim()) {
            toast.error(t('error.NAME_INVALID'));
            return false;
        }
        if (!formData.email.trim()) {
            toast.error(t('error.EMAIL_INVALID'));
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error(t('error.EMAIL_INVALID'));
            return false;
        }
        if (!formData.subject.trim()) {
            toast.error('Vui lòng nhập tiêu đề');
            return false;
        }
        if (!formData.message.trim()) {
            toast.error('Vui lòng nhập nội dung');
            return false;
        }
        if (formData.message.trim().length < 10) {
            toast.error('Nội dung phải có ít nhất 10 ký tự');
            return false;
        }
        return true;
    };

    const { execute: sendMessage, loading } = useMinLoadingAction({
        minLoadingTime: 1000,
        successMessage: t('contact.sendSuccess'),
        errorMessage: t('contact.sendError'),
        onSuccess: () => {
            setFormData({
                fullName: '',
                email: '',
                phone: '',
                subject: '',
                message: '',
            });
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        // TODO: Gọi API khi có backend
        // await sendMessage(() => contactApi.sendMessage(formData));

        // Hiện tại chỉ simulate success
        await sendMessage(async () => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('Form data:', formData);
        });
    };

    // Social links data
    const socialLinks = [
        { name: t('contact.facebook'), icon: '📘', url: 'https://facebook.com', color: 'hover:text-blue-700' },
        { name: t('contact.zalo'), icon: '💬', url: 'https://zalo.me', color: 'hover:text-blue-500' },
        { name: t('contact.youtube'), icon: '📺', url: 'https://youtube.com', color: 'hover:text-red-600' },
        { name: t('contact.tiktok'), icon: '🎵', url: 'https://tiktok.com', color: 'hover:text-gray-900' },
        { name: t('contact.messenger'), icon: '💬', url: 'https://messenger.com', color: 'hover:text-blue-600' },
    ];

    // Quick support items
    const quickSupport = [
        { label: t('contact.quickBooking'), extension: '1', icon: '📅' },
        { label: t('contact.quickPayment'), extension: '2', icon: '💳' },
        { label: t('contact.quickComplaint'), extension: '3', icon: '📝' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Background Pattern */}
            <div className="fixed inset-0 opacity-5 pointer-events-none">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234299e1' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat',
                }} />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-6">
                {/* Header Section - Gradient như các page khác */}
                <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-2xl shadow-xl mb-8">
                    <div className="absolute top-0 right-0 opacity-10">
                        <svg className="w-64 h-64" fill="white" viewBox="0 0 24 24">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                        </svg>
                    </div>
                    <div className="relative z-10 p-6 text-center">
                        <h1 className="text-2xl md:text-3xl font-bold text-white">
                            📞 {t('contact.title')}
                        </h1>
                        <p className="text-blue-100 text-sm mt-1">
                            {t('contact.subtitle')}
                        </p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 60" className="w-full h-8">
                            <path fill="#f0f9ff" fillOpacity="1" d="M0,32L80,37.3C160,43,320,53,480,48C640,43,800,21,960,21C1120,21,1280,43,1360,53.3L1440,64L1440,60L1360,60C1280,60,1120,60,960,60C800,60,640,60,480,60C320,60,160,60,80,60L0,60Z" />
                        </svg>
                    </div>
                </div>

                {/* Main Grid - 3 columns on desktop, stack on mobile */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Column 1: Contact Info */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-2xl">🏥</span>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {t('contact.infoTitle')}
                                </h2>
                            </div>

                            <div className="space-y-4">
                                {/* Address */}
                                <div className="flex items-start gap-3">
                                    <span className="text-xl">📍</span>
                                    <div>
                                        <p className="font-medium text-gray-700 dark:text-gray-300">{t('contact.address')}</p>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">{t('contact.addressValue')}</p>
                                    </div>
                                </div>

                                {/* Hotline */}
                                <div className="flex items-start gap-3">
                                    <span className="text-xl">📞</span>
                                    <div>
                                        <p className="font-medium text-gray-700 dark:text-gray-300">{t('contact.hotline')}</p>
                                        <p className="text-blue-600 dark:text-blue-400 font-bold text-lg">1900 1234</p>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="flex items-start gap-3">
                                    <span className="text-xl">✉️</span>
                                    <div>
                                        <p className="font-medium text-gray-700 dark:text-gray-300">{t('contact.email')}</p>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">support@healthcareconnect.vn</p>
                                    </div>
                                </div>

                                {/* Working Hours */}
                                <div className="flex items-start gap-3">
                                    <span className="text-xl">🕒</span>
                                    <div>
                                        <p className="font-medium text-gray-700 dark:text-gray-300">{t('contact.workingHours')}</p>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                                            {t('contact.monSat')}: 8:00 - 20:00
                                        </p>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                                            {t('contact.sun')}: 8:00 - 12:00
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

                            {/* Quick Support */}
                            <div>
                                <p className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
                                    <span>📱</span> {t('contact.quickSupport')}
                                </p>
                                <div className="space-y-2">
                                    {quickSupport.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {item.icon} {item.label}
                                            </span>
                                            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                                1900 1234 ({item.extension})
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Contact Form */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-2xl">📝</span>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {t('contact.formTitle')}
                                </h2>
                            </div>

                            {isAuthenticated ? (
                                // 🟢 ĐÃ ĐĂNG NHẬP - Hiển thị form bình thường
                                <>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                        {t('contact.formDescription')}
                                    </p>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <Input
                                            label={t('contact.fullName')}
                                            value={formData.fullName}
                                            onChange={(e) => handleChange('fullName', e.target.value)}
                                            placeholder={t('contact.fullNamePlaceholder')}
                                            required
                                        />

                                        <Input
                                            label={t('contact.email')}
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleChange('email', e.target.value)}
                                            placeholder={t('contact.emailPlaceholder')}
                                            required
                                        />

                                        <Input
                                            label={t('contact.phone')}
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => handleChange('phone', e.target.value)}
                                            placeholder={t('contact.phonePlaceholder')}
                                        />

                                        <Input
                                            label={t('contact.subject')}
                                            value={formData.subject}
                                            onChange={(e) => handleChange('subject', e.target.value)}
                                            placeholder={t('contact.subjectPlaceholder')}
                                            required
                                        />

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                {t('contact.message')} <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                value={formData.message}
                                                onChange={(e) => handleChange('message', e.target.value)}
                                                rows={5}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                                                placeholder={t('contact.messagePlaceholder')}
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            variant="primary"
                                            size="lg"
                                            fullWidth
                                            loading={loading}
                                            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
                                        >
                                            {loading ? t('contact.sending') : `📤 ${t('contact.sendButton')}`}
                                        </Button>
                                    </form>
                                </>
                            ) : (
                                // 🔴 CHƯA ĐĂNG NHẬP - Hiển thị thông báo + nút chuyển sang Login
                                <div className="text-center py-8">
                                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                                        <span className="text-4xl">🔒</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        Cần đăng nhập để gửi câu hỏi
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                        Vui lòng đăng nhập để chúng tôi có thể phản hồi bạn
                                    </p>
                                    <Button
                                        variant="primary"
                                        onClick={() => navigate('/login')}
                                        className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
                                    >
                                        🔑 Đăng nhập
                                    </Button>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
                                        Chưa có tài khoản? <a href="/register" className="text-blue-600 hover:underline">Đăng ký ngay</a>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Column 3: Google Maps */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-2xl">🗺️</span>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {t('contact.mapTitle')}
                                </h2>
                            </div>

                            <div className="rounded-xl overflow-hidden shadow-md">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.123456789!2d106.700000!3d10.775000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317529292e8d3dd1%3A0xf15f5aad7732a112!2sNguy%E1%BB%85n%20Hu%E1%BB%87%2C%20B%E1%BA%BFn%20Ngh%C3%A9%2C%20Qu%E1%BA%ADn%201%2C%20H%E1%BB%93%20Ch%C3%AD%20Minh!5e0!3m2!1svi!2s!4v1234567890"
                                    width="100%"
                                    height="280"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    title="Google Maps"
                                    className="rounded-lg"
                                ></iframe>
                            </div>

                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 text-center">
                                📍 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh
                            </p>
                        </div>
                    </div>
                </div>

                {/* Social Links Section */}
                <div className="mt-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6 text-center">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-2">
                            <span>💡</span> {t('contact.connectTitle')}
                        </h3>
                        <div className="flex flex-wrap justify-center gap-4">
                            {socialLinks.map((social, idx) => (
                                <a
                                    key={idx}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex flex-col items-center gap-1 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 ${social.color}`}
                                >
                                    <span className="text-2xl">{social.icon}</span>
                                    <span className="text-xs text-gray-600 dark:text-gray-400">{social.name}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;