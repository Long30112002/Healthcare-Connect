import { Link } from 'react-router-dom';
import { useAppTranslation } from '../../application/hooks/useAppTranslation';
import { useState, useEffect, useRef } from 'react';
import { configApi } from '../../infrastructure/api/configApi';
import { publicHomeApi } from '../../infrastructure/api/publicHomeApi';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import type { PublicTopDoctorResponse, ReviewResponse } from '../../core/types/api.response';
import HeroSection from './components/home/HeroSection';
import CTASection from './components/home/CTASection';

const PublicHomePage = () => {
  const { t, currentLanguage } = useAppTranslation();

  // ================= STATE =================
  const [configs, setConfigs] = useState<Record<string, string>>({});
  const [topDoctors, setTopDoctors] = useState<PublicTopDoctorResponse[]>([]);
  const [featuredReviews, setFeaturedReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const safeParseArray = (value?: string): any[] => {
    try {
      if (!value) return [];
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [configData, doctors, reviews] = await Promise.all([
          configApi.getAllConfigs(),
          publicHomeApi.getTopDoctors(4),
          publicHomeApi.getFeaturedReviews(6)
        ]);
        setConfigs(configData || {});
        setTopDoctors(doctors || []);
        setFeaturedReviews(reviews || []);

        console.log(configData);
      } catch (error) {
        console.error('Failed to load home data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const languageSuffix = currentLanguage === 'vi' ? 'VI' : 'EN';

  // Hero Slides - ưu tiên config, fallback sang i18n (giữ gradient + icon)
  const heroSlidesFromConfig = safeParseArray(configs[`HOME_HERO_SLIDES_${languageSuffix}`]);
  const slidesFromI18n = t('home.heroSlides', { returnObjects: true }) as Array<any>;
  const heroSlides = heroSlidesFromConfig.length > 0 ? heroSlidesFromConfig : slidesFromI18n;

  // Features - ưu tiên config, fallback sang i18n
  const featuresFromConfig = safeParseArray(configs[`HOME_FEATURES_${languageSuffix}`]);
  const featuresFromI18n = [
    { icon: '👨‍⚕️', title: t('home.feature1.title'), desc: t('home.feature1.desc'), color: 'from-blue-500 to-cyan-500' },
    { icon: '📅', title: t('home.feature2.title'), desc: t('home.feature2.desc'), color: 'from-green-500 to-teal-500' },
    { icon: '💊', title: t('home.feature3.title'), desc: t('home.feature3.desc'), color: 'from-purple-500 to-pink-500' },
    { icon: '🤖', title: t('home.feature4.title'), desc: t('home.feature4.desc'), color: 'from-orange-500 to-red-500' },
    { icon: '🏥', title: t('home.feature5.title'), desc: t('home.feature5.desc'), color: 'from-indigo-500 to-blue-500' },
    { icon: '⭐', title: t('home.feature6.title'), desc: t('home.feature6.desc'), color: 'from-yellow-500 to-amber-500' },
  ];
  const features = featuresFromConfig.length > 0 ? featuresFromConfig : featuresFromI18n;

  // Stats - ưu tiên config, fallback sang i18n
  const statsFromConfig = safeParseArray(configs[`HOME_STATS_${languageSuffix}`]);
  const statsFromI18n = [
    { value: '500+', label: t('home.stats.doctors'), icon: '👨‍⚕️' },
    { value: '50K+', label: t('home.stats.patients'), icon: '👥' },
    { value: '100+', label: t('home.stats.hospitals'), icon: '🏥' },
    { value: '4.9', label: t('home.stats.rating'), icon: '⭐' },
  ];
  const stats = statsFromConfig.length > 0 ? statsFromConfig : statsFromI18n;

  // CTA - ưu tiên config, fallback sang i18n
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
    bgGradient: getBgGradient(slide.id),
    imageUrl: slide.imageUrl
  }));

  // ================= CAROUSEL STATE =================
  const [, setCurrentSlide] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const testimonialTouchStartX = useRef<number>(0);
  const testimonialTouchEndX = useRef<number>(0);
  const testimonialMouseStartX = useRef<number>(0);
  const isTestimonialDragging = useRef<boolean>(false);

  // Auto play carousel
  useEffect(() => {
    if (slides.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Reset testimonial on resize
  useEffect(() => {
    const handleResize = () => setCurrentTestimonial(0);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen variant="dots" text={t('common.loading')} />;
  }

  if (slides.length === 0) {
    return <LoadingSpinner fullScreen variant="dots" text={t('common.loading')} />;
  }

  // Testimonial handlers
  const handleTestimonialTouchStart = (e: React.TouchEvent) => {
    testimonialTouchStartX.current = e.touches[0].clientX;
  };

  const handleTestimonialTouchMove = (e: React.TouchEvent) => {
    testimonialTouchEndX.current = e.touches[0].clientX;
  };

  const handleTestimonialTouchEnd = () => {
    const deltaX = testimonialTouchEndX.current - testimonialTouchStartX.current;
    const minSwipeDistance = 50;
    const maxSlides = Math.max(0, featuredReviews.length - (isMobile ? 1 : 3));
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
    const maxSlides = Math.max(0, featuredReviews.length - (isMobile ? 1 : 3));
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

  // Testimonial data (fallback nếu API chưa có)
  const defaultTestimonials = [
    { name: 'Nguyễn Thị A', role: 'Bệnh nhân', content: t('home.testimonial1'), avatar: '👩', rating: 5 },
    { name: 'Trần Văn B', role: 'Bệnh nhân', content: t('home.testimonial2'), avatar: '👨', rating: 5 },
    { name: 'Lê Thị C', role: 'Bệnh nhân', content: t('home.testimonial3'), avatar: '👩', rating: 4 },
    { name: 'Phạm Văn D', role: 'Bệnh nhân', content: 'Dịch vụ tuyệt vời, bác sĩ tận tâm!', avatar: '👨', rating: 5 },
    { name: 'Hoàng Thị E', role: 'Bệnh nhân', content: 'Đặt lịch nhanh chóng, tiện lợi.', avatar: '👩', rating: 4 },
    { name: 'Vũ Văn F', role: 'Bệnh nhân', content: 'Cơ sở vật chất hiện đại, sạch sẽ.', avatar: '👨', rating: 5 },
    { name: 'Ngô Thị G', role: 'Bệnh nhân', content: 'Nhân viên thân thiện, nhiệt tình.', avatar: '👩', rating: 5 },
    { name: 'Đặng Văn H', role: 'Bệnh nhân', content: 'Chi phí hợp lý, chất lượng tốt.', avatar: '👨', rating: 4 },
  ];
  const testimonials = featuredReviews.length > 0 ? featuredReviews : defaultTestimonials;

  // Doctors data (fallback nếu API chưa có)
  const defaultDoctors = [
    { name: 'BS. Nguyễn Văn An', specialty: t('home.doctor1.specialty'), experience: '15 năm', image: '👨‍⚕️', rating: 4.9 },
    { name: 'BS. Trần Thị Bình', specialty: t('home.doctor2.specialty'), experience: '12 năm', image: '👩‍⚕️', rating: 4.8 },
    { name: 'BS. Lê Văn Cường', specialty: t('home.doctor3.specialty'), experience: '20 năm', image: '👨‍⚕️', rating: 5.0 },
    { name: 'BS. Phạm Thị Dung', specialty: t('home.doctor4.specialty'), experience: '8 năm', image: '👩‍⚕️', rating: 4.7 },
  ];
  const doctorsList = topDoctors.length > 0 ? topDoctors : defaultDoctors;

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section với CAROUSEL và SWIPE - GIỮ NGUYÊN */}
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
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
                {t('home.features.title')}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {t('home.features.subtitle')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature: any, index: number) => (
                <div
                  key={index}
                  className="group bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`text-5xl mb-4 inline-block bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Doctors Section - From API hoặc fallback */}
      {doctorsList.length > 0 && (
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
              {doctorsList.map((doctor: any, index: number) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-md hover:shadow-lg transition"
                >
                  <div className="text-6xl mb-4">{doctor.image || doctor.fullName?.charAt(0) || '👨‍⚕️'}</div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                    {doctor.name || doctor.fullName}
                  </h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">{doctor.specialty || doctor.specialtyName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{doctor.experience || `${doctor.experienceYears} năm kinh nghiệm`}</p>
                  <div className="flex justify-center items-center gap-1 mt-2">
                    <span className="text-yellow-500">⭐</span>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {doctor.rating || doctor.averageRating?.toFixed(1) || '4.9'}
                    </span>
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

      {/* Testimonials Section - CAROUSEL với SWIPE */}
      {testimonials.length > 0 && (
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
                  style={{ transform: `translateX(-${currentTestimonial * (100 / (isMobile ? 1 : 3))}%)` }}
                >
                  {testimonials.map((testimonial: any, index: number) => (
                    <div
                      key={index}
                      className="w-full md:w-1/3 flex-shrink-0 px-3"
                    >
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow-md hover:shadow-lg transition h-full">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="text-4xl">{testimonial.avatar || testimonial.patientName?.charAt(0) || '👤'}</div>
                          <div>
                            <h4 className="font-semibold text-gray-800 dark:text-white">
                              {testimonial.isAnonymous ? t('common.anonymous') : (testimonial.name || testimonial.patientName)}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Bệnh nhân</p>
                          </div>
                        </div>
                        <div className="flex mb-3">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <span key={i} className="text-yellow-500 text-lg">★</span>
                          ))}
                          {[...Array(5 - testimonial.rating)].map((_, i) => (
                            <span key={i} className="text-gray-300 dark:text-gray-600 text-lg">★</span>
                          ))}
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 italic leading-relaxed">
                          "{testimonial.comment || testimonial.content}"
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

      {/* CTA Section - Dynamic */}
      <CTASection
        title={ctaTitle}
        subtitle={ctaSubtitle}
        buttonText={ctaButtonText}
        backgroundImage={configs.HOME_CTA_BACKGROUND_IMAGE}
      />

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
      `}</style>
    </div>
  );
};

export default PublicHomePage;