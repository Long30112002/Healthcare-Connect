import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../../../application/context/ThemeContext';
import { useAppTranslation } from '../../../../application/hooks/useAppTranslation';
import registerIcon from '../../../assets/images/register.png';
import appointmentIcon from '../../../assets/images/medical-appointment.png';
import scheduleIcon from '../../../assets/images/schedule.png';
import dashboardIcon from '../../../assets/images/dashboard.png';
import findDoctorIcon from '../../../assets/images/find.png';
import { useAuth } from '../../../../application/context/AuthContext';

interface HeroSlide {
    id: number;
    title: string;
    subtitle: string;
    description: string;
    imageUrl: string;
    icon?: string;
}

interface HeroSectionProps {
    slides: HeroSlide[];
    autoPlayInterval?: number;
}

const HeroSection = ({ slides, autoPlayInterval = 5000 }: HeroSectionProps) => {
    const { t } = useAppTranslation();
    const { theme } = useTheme();

    const [currentSlide, setCurrentSlide] = useState(0);
    const touchStartX = useRef<number>(0);
    const touchEndX = useRef<number>(0);
    const mouseStartX = useRef<number>(0);
    const isDragging = useRef<boolean>(false);
    const { isAuthenticated, user } = useAuth();



    const getAuthButton = () => {
        if (!isAuthenticated) {
            return {
                text: t('home.hero.register'),
                link: '/register',
                icon: registerIcon,
                alt: 'Register'
            };
        }
        switch (user?.role) {
            case 'PATIENT':
                return {
                    text: t('home.hero.myAppointments'),
                    link: '/appointments',
                    icon: appointmentIcon,
                    alt: 'My Appointments'
                };
            case 'DOCTOR':
                return {
                    text: t('home.hero.mySchedule'),
                    link: '/my-schedule',
                    icon: scheduleIcon,
                    alt: 'My Schedule'
                };
            case 'RECEPTIONIST':
            case 'HOSPITAL_MANAGER':
            case 'ADMIN':
                return {
                    text: t('home.hero.dashboard'),
                    link: `/${user?.role.toLowerCase().replace('_', '-')}/dashboard`,
                    icon: dashboardIcon,
                    alt: 'Dashboard'
                };
            default:
                return {
                    text: t('home.hero.register'),
                    link: '/register',
                    icon: registerIcon,
                    alt: 'Register'
                };
        }
    };

    const authButton = getAuthButton();
    // Auto play
    useEffect(() => {
        if (slides.length === 0) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, autoPlayInterval);
        return () => clearInterval(interval);
    }, [slides.length, autoPlayInterval]);

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    // Touch events cho mobile
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        const deltaX = touchEndX.current - touchStartX.current;
        const minSwipeDistance = 50;

        if (Math.abs(deltaX) > minSwipeDistance && slides.length > 0) {
            if (deltaX > 0) {
                setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
            } else {
                setCurrentSlide((prev) => (prev + 1) % slides.length);
            }
        }

        touchStartX.current = 0;
        touchEndX.current = 0;
    };

    // Mouse events cho desktop
    const handleMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true;
        mouseStartX.current = e.clientX;
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current) return;
        const dragElement = e.currentTarget as HTMLElement;
        const deltaX = e.clientX - mouseStartX.current;
        dragElement.style.transform = `translateX(${deltaX * 0.3}px)`;
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        if (!isDragging.current) return;
        isDragging.current = false;

        const deltaX = e.clientX - mouseStartX.current;
        const minDragDistance = 50;
        const dragElement = e.currentTarget as HTMLElement;
        dragElement.style.transform = '';

        if (Math.abs(deltaX) > minDragDistance && slides.length > 0) {
            if (deltaX > 0) {
                setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
            } else {
                setCurrentSlide((prev) => (prev + 1) % slides.length);
            }
        }
        mouseStartX.current = 0;
    };

    const handleMouseLeave = () => {
        if (isDragging.current) {
            isDragging.current = false;
            const dragElement = document.querySelector('.hero-carousel') as HTMLElement;
            if (dragElement) dragElement.style.transform = '';
        }
    };

    if (slides.length === 0) return null;

    const current = slides[currentSlide];

    return (
        <section
            className="hero-carousel relative w-full min-h-[550px] md:min-h-[650px] overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
            {/* Background Image */}
            <div className="absolute inset-0 w-full h-full">
                <img
                    src={current.imageUrl}
                    alt={current.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://picsum.photos/id/20/1920/1080';
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 w-full h-full flex items-center min-h-[550px] md:min-h-[650px]">
                <div className="container mx-auto px-4 md:px-8">
                    <div className="max-w-xl text-white">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                            {current.title}
                        </h1>
                        <p className="text-lg md:text-xl text-white/90 mb-3">
                            {current.subtitle}
                        </p>
                        <p className="text-base md:text-lg text-white/80 mb-8">
                            {current.description}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                to={authButton.link}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition text-center flex items-center justify-center gap-2"
                            >
                                <img src={authButton.icon} alt={authButton.alt} className="w-5 h-5 object-contain" />
                                {authButton.text}
                            </Link>
                            {!isAuthenticated && (
                                <Link
                                    to="/doctors/public"
                                    className="px-6 py-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-lg font-semibold transition text-center flex items-center justify-center gap-2"
                                >
                                    <img src={findDoctorIcon} alt="Find Doctor" className="w-5 h-5 object-contain" />
                                    {t('home.hero.findDoctor')}
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Dots */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-10">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${currentSlide === index
                            ? 'w-8 bg-white'
                            : 'w-2 bg-white/50 hover:bg-white/80'
                            }`}
                    />
                ))}
            </div>

            {/* Wave decoration */}
            <div className="absolute bottom-0 left-0 right-0 w-full pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-12 md:h-16">
                    <path fill={theme === 'dark' ? '#111827' : '#f3f4f6'} fillOpacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
                </svg>
            </div>
        </section>
    );
};

export default HeroSection;