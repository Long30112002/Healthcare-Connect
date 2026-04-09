import { Link } from 'react-router-dom';
import { useTheme } from '../../application/context/ThemeContext';
import { useAppTranslation } from '../../application/hooks/useAppTranslation';
import { useState, useEffect, useRef } from 'react';

const PublicHomePage = () => {
  const { t } = useAppTranslation();
  const { theme } = useTheme();

  const slides = [
    {
      id: 1,
      title: t('home.hero.title'),
      subtitle: t('home.hero.subtitle'),
      description: t('home.hero.description'),
      icon: '🏥',
      bgGradient: 'from-blue-600 via-blue-500 to-cyan-500'
    },
    {
      id: 2,
      title: 'Đội ngũ bác sĩ hàng đầu',
      subtitle: 'Chuyên gia giàu kinh nghiệm',
      description: 'Hơn 500 bác sĩ chuyên khoa giỏi, tận tâm với nghề',
      icon: '👨‍⚕️',
      bgGradient: 'from-green-600 via-green-500 to-teal-500'
    },
    {
      id: 3,
      title: 'Công nghệ hiện đại',
      subtitle: 'Đặt lịch khám trực tuyến',
      description: 'Hệ thống đặt lịch thông minh, thanh toán dễ dàng',
      icon: '💻',
      bgGradient: 'from-purple-600 via-purple-500 to-pink-500'
    },
    {
      id: 4,
      title: 'Bảo hiểm y tế toàn diện',
      subtitle: 'Chi phí hợp lý',
      description: 'Liên kết với nhiều bảo hiểm, hỗ trợ tối đa cho bệnh nhân',
      icon: '📋',
      bgGradient: 'from-orange-600 via-orange-500 to-red-500'
    },
    {
      id: 5,
      title: 'Chăm sóc tận tâm',
      subtitle: 'Sức khỏe là vàng',
      description: 'Đồng hành cùng bạn trên mọi chặng đường chăm sóc sức khỏe',
      icon: '❤️',
      bgGradient: 'from-rose-600 via-rose-500 to-pink-500'
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const mouseStartX = useRef<number>(0);
  const isDragging = useRef<boolean>(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const testimonialTouchStartX = useRef<number>(0);
  const testimonialTouchEndX = useRef<number>(0);
  const testimonialMouseStartX = useRef<number>(0);
  const isTestimonialDragging = useRef<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const deltaX = touchEndX.current - touchStartX.current;
    const minSwipeDistance = 50; // Ngưỡng tối thiểu để vuốt (px)

    if (Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
      } else {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    mouseStartX.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const currentX = e.clientX;
    const deltaX = currentX - mouseStartX.current;

    const dragElement = e.currentTarget as HTMLElement;
    dragElement.style.transform = `translateX(${deltaX * 0.3}px)`;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;

    const endX = e.clientX;
    const deltaX = endX - mouseStartX.current;
    const minDragDistance = 50;

    const dragElement = e.currentTarget as HTMLElement;
    dragElement.style.transform = '';

    if (Math.abs(deltaX) > minDragDistance) {
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
      const dragElement = document.querySelector('.carousel-drag-area') as HTMLElement;
      if (dragElement) {
        dragElement.style.transform = '';
      }
    }
  };

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
    const maxSlides = Math.max(0, testimonials.length - 3);

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
    const maxSlides = Math.max(0, testimonials.length - 3);

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

  const current = slides[currentSlide];

  const features = [
    { icon: '👨‍⚕️', title: t('home.feature1.title'), desc: t('home.feature1.desc'), color: 'from-blue-500 to-cyan-500' },
    { icon: '📅', title: t('home.feature2.title'), desc: t('home.feature2.desc'), color: 'from-green-500 to-teal-500' },
    { icon: '💊', title: t('home.feature3.title'), desc: t('home.feature3.desc'), color: 'from-purple-500 to-pink-500' },
    { icon: '🤖', title: t('home.feature4.title'), desc: t('home.feature4.desc'), color: 'from-orange-500 to-red-500' },
    { icon: '🏥', title: t('home.feature5.title'), desc: t('home.feature5.desc'), color: 'from-indigo-500 to-blue-500' },
    { icon: '⭐', title: t('home.feature6.title'), desc: t('home.feature6.desc'), color: 'from-yellow-500 to-amber-500' },
  ];

  const stats = [
    { value: '500+', label: t('home.stats.doctors'), icon: '👨‍⚕️' },
    { value: '50K+', label: t('home.stats.patients'), icon: '👥' },
    { value: '100+', label: t('home.stats.hospitals'), icon: '🏥' },
    { value: '4.9', label: t('home.stats.rating'), icon: '⭐' },
  ];

  const testimonials = [
    { name: 'Nguyễn Thị A', role: 'Bệnh nhân', content: t('home.testimonial1'), avatar: '👩', rating: 5 },
    { name: 'Trần Văn B', role: 'Bệnh nhân', content: t('home.testimonial2'), avatar: '👨', rating: 5 },
    { name: 'Lê Thị C', role: 'Bệnh nhân', content: t('home.testimonial3'), avatar: '👩', rating: 4 },
    { name: 'Phạm Văn D', role: 'Bệnh nhân', content: 'Dịch vụ tuyệt vời, bác sĩ tận tâm!', avatar: '👨', rating: 5 },
    { name: 'Hoàng Thị E', role: 'Bệnh nhân', content: 'Đặt lịch nhanh chóng, tiện lợi.', avatar: '👩', rating: 4 },
    { name: 'Vũ Văn F', role: 'Bệnh nhân', content: 'Cơ sở vật chất hiện đại, sạch sẽ.', avatar: '👨', rating: 5 },
    { name: 'Ngô Thị G', role: 'Bệnh nhân', content: 'Nhân viên thân thiện, nhiệt tình.', avatar: '👩', rating: 5 },
    { name: 'Đặng Văn H', role: 'Bệnh nhân', content: 'Chi phí hợp lý, chất lượng tốt.', avatar: '👨', rating: 4 },
  ];

  const doctors = [
    { name: 'BS. Nguyễn Văn An', specialty: t('home.doctor1.specialty'), experience: '15 năm', image: '👨‍⚕️', rating: 4.9 },
    { name: 'BS. Trần Thị Bình', specialty: t('home.doctor2.specialty'), experience: '12 năm', image: '👩‍⚕️', rating: 4.8 },
    { name: 'BS. Lê Văn Cường', specialty: t('home.doctor3.specialty'), experience: '20 năm', image: '👨‍⚕️', rating: 5.0 },
    { name: 'BS. Phạm Thị Dung', specialty: t('home.doctor4.specialty'), experience: '8 năm', image: '👩‍⚕️', rating: 4.7 },
  ];

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section với CAROUSEL và SWIPE */}
      <section
        className="relative w-full min-h-[600px] md:min-h-[700px] overflow-hidden carousel-drag-area"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div className={`absolute inset-0 w-full bg-gradient-to-r ${current.bgGradient} transition-all duration-700`}>
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        {/* Nội dung Hero - vẫn có container để canh nội dung nhưng background đã full width */}
        <div className="relative z-10 w-full px-4 py-16 md:py-24">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="flex-1 text-center lg:text-left animate-fade-in">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                  {current.title}
                </h1>
                <p className="text-lg md:text-xl text-white/90 mb-3">
                  {current.subtitle}
                </p>
                <p className="text-base md:text-lg text-white/80 mb-8 max-w-2xl mx-auto lg:mx-0">
                  {current.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link
                    to="/register"
                    className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:shadow-lg transition transform hover:scale-105"
                  >
                    🚀 {t('home.hero.register')}
                  </Link>
                  <Link
                    to="/doctors/public"
                    className="px-6 py-3 bg-transparent border-2 border-white rounded-lg font-semibold text-white hover:bg-white/10 transition"
                  >
                    🔍 {t('home.hero.findDoctor')}
                  </Link>
                </div>
              </div>

              {/* Right Image - Icon thay đổi theo slide */}
              <div className="flex-1 flex justify-center pointer-events-none">
                <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
                  <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse-slow"></div>
                  <div className="absolute inset-4 bg-white/30 rounded-full animate-float-slow"></div>
                  <div className="absolute inset-8 flex items-center justify-center text-8xl md:text-9xl transition-all duration-500">
                    {current.icon}
                  </div>
                </div>
              </div>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-12">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${currentSlide === index
                    ? 'w-8 bg-white'
                    : 'w-2 bg-white/50 hover:bg-white/80'
                    }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Wave Decoration - full width */}
        <div className="absolute bottom-0 left-0 right-0 w-full z-10">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-12 md:h-16">
            <path fill={theme === 'dark' ? '#111827' : '#f3f4f6'} fillOpacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-4">
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
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
            {features.map((feature, index) => (
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

      {/* Doctors Section */}
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
            {doctors.map((doctor, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-md hover:shadow-lg transition"
              >
                <div className="text-6xl mb-4">{doctor.image}</div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                  {doctor.name}
                </h3>
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">{doctor.specialty}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{doctor.experience}</p>
                <div className="flex justify-center items-center gap-1 mt-2">
                  <span className="text-yellow-500">⭐</span>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{doctor.rating}</span>
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

      {/* Testimonials Section - CAROUSEL với SWIPE */}
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

          {/* Testimonials Carousel với Swipe */}
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
            {/* Carousel Container */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentTestimonial * (100 / (window.innerWidth < 768 ? 1 : 3))}%)` }}
              >
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="w-full md:w-1/3 flex-shrink-0 px-3"
                  >
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow-md hover:shadow-lg transition h-full">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="text-4xl">{testimonial.avatar}</div>
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-white">{testimonial.name}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
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
                        "{testimonial.content}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('home.cta.title')}
          </h2>
          <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
            {t('home.cta.subtitle')}
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:shadow-lg transition transform hover:scale-105"
          >
            {t('home.cta.button')}
          </Link>
        </div>
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
      `}</style>
    </div>
  );
};

export default PublicHomePage;