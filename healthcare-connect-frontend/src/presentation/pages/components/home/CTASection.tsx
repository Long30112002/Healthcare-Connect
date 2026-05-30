import { Link } from 'react-router-dom';
import { useAuth } from '../../../../application/context/AuthContext';
import { useAppTranslation } from '../../../../application/hooks/useAppTranslation';
import { images } from '../../../../shared/utils/imageUtils';

interface CTASectionProps {
    title: string;
    subtitle: string;
    buttonText: string;
    backgroundImage?: string;
}

const CTASection = ({ title, subtitle, buttonText, backgroundImage }: CTASectionProps) => {
    const { t } = useAppTranslation();
    const { isAuthenticated, user } = useAuth();

    const getCTAButton = () => {
        if (!isAuthenticated) {
            return {
                text: buttonText,
                link: '/register',
                icon: images.register(),
                alt: 'Register'
            };
        }

        switch (user?.role) {
            case 'PATIENT':
                return {
                    text: t('home.cta.myAppointments'),
                    link: '/appointments',
                    icon: images.appointment(),
                    alt: 'My Appointments'
                };
            case 'DOCTOR':
                return {
                    text: t('home.cta.mySchedule'),
                    link: '/my-schedule',
                    icon: images.schedule(),
                    alt: 'My Schedule'
                };
            case 'RECEPTIONIST':
            case 'HOSPITAL_MANAGER':
            case 'ADMIN':
                return {
                    text: t('home.cta.dashboard'),
                    link: `/${user?.role.toLowerCase().replace('_', '-')}/dashboard`,
                    icon: images.dashboard(),
                    alt: 'Dashboard'
                };
            default:
                return {
                    text: buttonText,
                    link: '/register',
                    icon: images.register(),
                    alt: 'Register'
                };
        }
    };

    const ctaButton = getCTAButton();

    return (
        <section className="relative py-20 md:py-28 overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 w-full h-full">
                <img
                    src={backgroundImage}
                    // || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1920&h=600&fit=crop'
                    alt="CTA Background"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).parentElement?.classList.add('bg-gradient-to-r', 'from-blue-600', 'to-cyan-500');
                    }}
                />
                <div className="absolute inset-0 bg-black/50"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 text-center">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                    {title}
                </h2>
                <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                    {subtitle}
                </p>
                <Link
                    to={ctaButton.link}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:shadow-lg transition transform hover:scale-105"
                >
                    <img src={ctaButton.icon} alt={ctaButton.alt} className="w-5 h-5 object-contain" />
                    {ctaButton.text}
                </Link>
            </div>
        </section>
    );
};

export default CTASection;