import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAppTranslation } from '../../application/hooks/useAppTranslation';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { configApi } from '../../infrastructure/api/configApi';
import { publicHomeApi } from '../../infrastructure/api/publicHomeApi';
import type { PublicTopDoctorResponse, ReviewResponse } from '../../core/types/api.response';
import HeroSection from './components/home/HeroSection';
import teamWorkImage from '../assets/images/team-work.png';
import CTASection from './components/home/CTASection';


const PublicHomePage = () => {
  const { t, currentLanguage } = useAppTranslation();

  // State cho dynamic content
  const [configs, setConfigs] = useState<Record<string, string>>({});
  const [topDoctors, setTopDoctors] = useState<PublicTopDoctorResponse[]>([]);
  const [featuredReviews, setFeaturedReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Lấy suffix ngôn ngữ
  const languageSuffix = currentLanguage === 'vi' ? 'VI' : 'EN';

  // Parse JSON từ config theo ngôn ngữ
  const heroSlidesKey = `HOME_HERO_SLIDES_${languageSuffix}`;
  const heroSlides = configs[heroSlidesKey]
    ? JSON.parse(configs[heroSlidesKey])
    : t('home.heroSlides', { returnObjects: true });
  // Lấy từ database config 
  const features = configs[`HOME_FEATURES_${languageSuffix}`]
    ? JSON.parse(configs[`HOME_FEATURES_${languageSuffix}`])
    : [];
  const stats = configs[`HOME_STATS_${languageSuffix}`]
    ? JSON.parse(configs[`HOME_STATS_${languageSuffix}`])
    : [];
  const ctaTitle = configs[`HOME_CTA_TITLE_${languageSuffix}`] || t('home.cta.title');
  const ctaSubtitle = configs[`HOME_CTA_SUBTITLE_${languageSuffix}`] || t('home.cta.subtitle');
  const ctaButtonText = configs[`HOME_CTA_BUTTON_TEXT_${languageSuffix}`] || t('home.cta.button');

  const getBgGradient = (id: number): string => {
    switch (id) {
      case 1: return 'from-blue-600 via-blue-500 to-cyan-500';
      case 2: return 'from-green-600 via-green-500 to-teal-500';
      case 3: return 'from-purple-600 via-purple-500 to-pink-500';
      case 4: return 'from-orange-600 via-orange-500 to-red-500';
      case 5: return 'from-rose-600 via-rose-500 to-pink-500';
      default: return 'from-blue-600 via-blue-500 to-cyan-500';
    }
  };

  const slides = heroSlides.map((slide: any) => ({
    ...slide,
    bgGradient: getBgGradient(slide.id)
  }));

  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const testimonialTouchStartX = useRef<number>(0);
  const testimonialTouchEndX = useRef<number>(0);
  const testimonialMouseStartX = useRef<number>(0);
  const isTestimonialDragging = useRef<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (slides.length > 0) {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [configData, doctors, reviews] = await Promise.all([
          configApi.getAllConfigs(),
          publicHomeApi.getTopDoctors(4),
          publicHomeApi.getFeaturedReviews(6)
        ]);
        setConfigs(configData);
        setTopDoctors(doctors);
        setFeaturedReviews(reviews);
      } catch (error) {
        console.error('Failed to load home data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setCurrentTestimonial(0);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTestimonialTouchStart = (e: React.TouchEvent) => {
    testimonialTouchStartX.current = e.touches[0].clientX;
  };

  const handleTestimonialTouchMove = (e: React.TouchEvent) => {
    testimonialTouchEndX.current = e.touches[0].clientX;
  };

  const handleTestimonialTouchEnd = () => {
    const deltaX = testimonialTouchEndX.current - testimonialTouchStartX.current;
    const minSwipeDistance = 50;
    const maxSlides = Math.max(0, featuredReviews.length - 3);

    if (Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        setCurrentTestimonial(prev => Math.max(0, prev - 1));
      } else {
        setCurrentTestimonial(prev => Math.min(maxSlides, prev + 1));
      }
    }

    testimonialTouchStartX.current = 0;
    testimonialTouchEndX.current = 0;
  };

  const handleTestimonialMouseDown = (e: React.MouseEvent) => {
    isTestimonialDragging.current = true;
    testimonialMouseStartX.current = e.clientX;
    const dragElement = e.currentTarget as HTMLElement;
    dragElement.style.cursor = 'grabbing';
  };

  const handleTestimonialMouseMove = (e: React.MouseEvent) => {
    if (!isTestimonialDragging.current) return;
    const currentX = e.clientX;
    const deltaX = currentX - testimonialMouseStartX.current;

    const dragElement = e.currentTarget as HTMLElement;
    dragElement.style.transform = `translateX(${deltaX * 0.3}px)`;
  };

  const handleTestimonialMouseUp = (e: React.MouseEvent) => {
    if (!isTestimonialDragging.current) return;
    isTestimonialDragging.current = false;

    const endX = e.clientX;
    const deltaX = endX - testimonialMouseStartX.current;
    const minDragDistance = 50;
    const maxSlides = Math.max(0, featuredReviews.length - 3);

    const dragElement = e.currentTarget as HTMLElement;
    dragElement.style.transform = '';
    dragElement.style.cursor = 'grab';

    if (Math.abs(deltaX) > minDragDistance) {
      if (deltaX > 0) {
        setCurrentTestimonial(prev => Math.max(0, prev - 1));
      } else {
        setCurrentTestimonial(prev => Math.min(maxSlides, prev + 1));
      }
    }

    testimonialMouseStartX.current = 0;
  };

  const handleTestimonialMouseLeave = (e: React.MouseEvent) => {
    if (isTestimonialDragging.current) {
      isTestimonialDragging.current = false;
      const dragElement = e.currentTarget as HTMLElement;
      dragElement.style.transform = '';
      dragElement.style.cursor = 'grab';
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen variant="dots" text={t('common.loading')} />;
  }

  // Nếu không có slides, hiển thị loading hoặc empty
  if (slides.length === 0) {
    return <LoadingSpinner fullScreen variant="dots" text={t('common.loading')} />;
  }

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section với CAROUSEL và SWIPE */}
      <HeroSection slides={slides} autoPlayInterval={5000} />

      {/* Stats Section - Dynamic */}
      {stats.length > 0 && (
        <section className="py-12 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat: any, index: number) => (
                <div key={index} className="text-center p-4">
                  <div className="text-4xl mb-2">{stat.icon}</div>
                  <div className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">{stat.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section - Dynamic */}
      {features.length > 0 && (
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                <img src={teamWorkImage} alt="Features" className="w-10 h-10 object-contain" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
                {t('home.features.title')}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {t('home.features.subtitle')}
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature: any, index: number) => (
                <div
                  key={index}
                  className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-gray-700"
                >
                  {/* Icon/Image với background gradient */}
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-3xl mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
                    {feature.title}
                  </h3>

                  {/* Description - dài hơn, phong phú hơn */}
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.desc}
                  </p>

                  {/* Divider với hiệu ứng khi hover */}
                  <div className="w-12 h-0.5 bg-blue-500 mt-4 group-hover:w-full transition-all duration-500"></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Doctors Section - From API */}
      {topDoctors.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
                {t('home.doctors.title')}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {t('home.doctors.subtitle')}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {topDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-md hover:shadow-lg transition"
                >
                  <div className="text-6xl mb-4">
                    {doctor.fullName?.charAt(0) || '👨‍⚕️'}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                    {doctor.fullName}
                  </h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">{doctor.specialtyName}</p>

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {doctor.experienceYears} {t('doctor.yearsExperience')}
                  </p>

                  <div className="flex justify-center items-center gap-1 mt-2">
                    {doctor.averageRating > 0 ? (
                      <>
                        <span className="text-yellow-500">⭐</span>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {doctor.averageRating.toFixed(1)}/5
                        </span>
                        <span className="text-xs text-gray-400">
                          ({doctor.totalReviews} {t('doctor.reviews')})
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400">
                        {t('doctor.noReviewsYet')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                to="/doctors/public"
                className="inline-block px-6 py-2 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                {t('home.doctors.viewAll')} →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section - From API */}
      {featuredReviews.length > 0 && (
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
                {t('home.testimonials.title')}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {t('home.testimonials.subtitle')}
              </p>
            </div>

            <div
              className="relative"
              onTouchStart={handleTestimonialTouchStart}
              onTouchMove={handleTestimonialTouchMove}
              onTouchEnd={handleTestimonialTouchEnd}
              onMouseDown={handleTestimonialMouseDown}
              onMouseMove={handleTestimonialMouseMove}
              onMouseUp={handleTestimonialMouseUp}
              onMouseLeave={handleTestimonialMouseLeave}
              style={{ cursor: isTestimonialDragging.current ? 'grabbing' : 'grab' }}
            >
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${currentTestimonial * (100 / (window.innerWidth < 768 ? 1 : 3))}%)` }}
                >
                  {featuredReviews.map((review) => (
                    <div
                      key={review.id}
                      className="w-full md:w-1/3 flex-shrink-0 px-3"
                    >
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow-md hover:shadow-lg transition h-full">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="text-4xl">
                            {review.patientName?.charAt(0) || '👤'}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 dark:text-white">
                              {review.isAnonymous ? t('common.anonymous') : review.patientName}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('home.testimonials.patient')}</p>
                          </div>
                        </div>
                        <div className="flex mb-3">
                          {[...Array(review.rating)].map((_, i) => (
                            <span key={i} className="text-yellow-500 text-lg">★</span>
                          ))}
                          {[...Array(5 - review.rating)].map((_, i) => (
                            <span key={i} className="text-gray-300 dark:text-gray-600 text-lg">★</span>
                          ))}
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 italic leading-relaxed">
                          "{review.comment}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Dynamic với ảnh nền */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src={configs.HOME_CTA_BACKGROUND_IMAGE || ''}
            alt="CTA Background"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).parentElement?.classList.add('bg-gradient-to-r', 'from-blue-600', 'to-cyan-500');
            }}
          />
          {/* Overlay để text đọc được */}
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        {/* Content - giữ nguyên căn giữa */}
        <CTASection
          title={ctaTitle}
          subtitle={ctaSubtitle}
          buttonText={ctaButtonText}
          backgroundImage={configs.HOME_CTA_BACKGROUND_IMAGE}
        />
      </section>

      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
          @keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.feature-card {
    animation: fadeInUp 0.6s ease-out forwards;
    animation-delay: calc(var(--index) * 0.1s);
}
      `}</style>
    </div>
  );
};

export default PublicHomePage;