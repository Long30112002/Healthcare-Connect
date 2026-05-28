import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../application/context/AuthContext';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import logoHospital from '../../assets/images/hospital_logo.png';
import homeIcon from '../../assets/images/home.png';
import phoneIcon from '../../assets/images/phone-call.png';
import doctorIcon from '../../assets/images/doctor.png';
import appointmentIcon from '../../assets/images/medical-appointment.png';
import findIcon from '../../assets/images/find.png';
import healthcareIcon from '../../assets/images/healthcare.png';
import scheduleIcon from '../../assets/images/schedule.png'
import patientIcon from '../../assets/images/patient.png'
import statisticsIcon from '../../assets/images/statistics.png'
import reviewIcon from '../../assets/images/review.png'
import roomIcon from '../../assets/images/room.png'
import receptionistIcon from '../../assets/images/receptionist.png'
import clockIcon from '../../assets/images/clock.png'
import departmentsSpecialties from '../../assets/images/specialties.png'
import { useSystemConfig } from '../../../application/hooks/useSystemConfig';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { t, getRole } = useAppTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(true);
  const { configs = {}, loading } = useSystemConfig() || {};

  useEffect(() => {
    const checkScreen = () => {
      setIsLargeScreen(window.innerWidth >= 1280);
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-16">Loading...</div>;
  }

  const systemName = configs?.SYSTEM_NAME || 'Healthcare Connect';
  const systemLogo = configs?.SYSTEM_LOGO_URL || logoHospital;

  const handleLogout = async () => {
    setIsProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
    await logout();
  };

  const isActive = (path: string) => {
    const currentPath = location.pathname;

    // Trường hợp path là '/doctors'
    if (path === '/doctors') {
      return currentPath === '/doctors';
    }

    // Trường hợp path là '/' 
    if (path === '/') {
      // Nếu đã đăng nhập: Home chỉ active khi đang ở dashboard paths
      if (isAuthenticated) {
        const dashboardPaths = [
          '/dashboard', '/doctor/dashboard', '/receptionist/dashboard',
          '/admin/dashboard', '/manager/dashboard'
        ];
        // Khi đang ở dashboard thì active Home
        if (dashboardPaths.includes(currentPath)) {
          return true;
        }
        // Không active Home ở các trang khác khi đã login
        return false;
      }
      // Chưa đăng nhập: active khi đang ở '/'
      return currentPath === '/';
    }

    // Các trường hợp khác
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    switch (user?.role) {
      case 'PATIENT':
        navigate('/dashboard');
        break;
      case 'DOCTOR':
        navigate('/doctor/dashboard');
        break;
      case 'RECEPTIONIST':
        navigate('/receptionist/dashboard');
        break;
      case 'ADMIN':
        navigate('/admin/dashboard');
        break;
      case 'HOSPITAL_MANAGER':
        navigate('/manager/dashboard');
        break;
      default:
        navigate('/');
    }
  };

  // Helper: Kiểm tra có nên hiển thị Contact không
  const shouldShowContact = () => {
    if (!isAuthenticated) return true;
    if (user?.role === 'PATIENT') return true;
    return false;
  };

  // Menu công khai (hiển thị cho cả login và chưa login)
  const publicMenuItems = [
    { path: '/', label: t('nav.home'), shortLabel: '🏠', icon: homeIcon },
  ];

  // Thêm Contact vào publicMenuItems nếu được phép
  if (shouldShowContact()) {
    publicMenuItems.push({
      path: '/contact',
      label: t('nav.contact'),
      shortLabel: '📞',
      icon: phoneIcon
    });
  }

  // Menu chỉ hiển thị khi chưa login
  const unauthenticatedMenuItems = !isAuthenticated ? [
    { path: '/doctors/public', label: t('nav.doctors'), shortLabel: '👨‍⚕️', icon: doctorIcon },
  ] : [];

  // Menu riêng tư (thêm vào khi đã login) - KHÔNG hiển thị cho RECEPTIONIST
  const privateMenuItems = user && user.role === 'PATIENT' ? [
    { path: '/appointments', label: t('nav.appointments'), shortLabel: '📋', icon: appointmentIcon },
  ] : [];

  // Menu theo role
  const roleBasedItems: Record<string, typeof publicMenuItems> = {
    PATIENT: [
      { path: '/doctors', label: t('nav.findDoctors'), shortLabel: '🔍', icon: findIcon },
      { path: '/my-health', label: t('nav.myHealth'), shortLabel: '💊', icon: healthcareIcon },
    ],
    DOCTOR: [
      { path: '/my-schedule', label: t('nav.schedule'), shortLabel: '📅', icon: scheduleIcon },
      { path: '/my-patients', label: t('nav.patients'), shortLabel: '👥', icon: patientIcon },
      { path: '/doctor/statistics', label: t('nav.statistics'), shortLabel: '📊', icon: statisticsIcon },
      { path: '/doctor/reviews', label: t('nav.reviews'), shortLabel: '⭐', icon: reviewIcon },
    ],
    HOSPITAL_MANAGER: [
      { path: '/manager/doctors', label: t('nav.manageDoctors'), shortLabel: '👨‍⚕️', icon: doctorIcon },
      { path: '/manager/receptionists', label: t('nav.manageReceptionists'), shortLabel: '👩‍💼', icon: receptionistIcon },
      { path: '/manager/departments-specialties', label: t('nav.departmentsSpecialties'), shortLabel: '📋', icon: departmentsSpecialties },
      { path: '/manager/working-hours', label: t('nav.workingHours'), shortLabel: '⏰', icon: clockIcon },
      { path: '/manager/rooms', label: t('nav.rooms'), shortLabel: '🚪', icon: roomIcon },
      { path: '/manager/medicines', label: t('nav.medicines'), shortLabel: '💊', icon: healthcareIcon },
      { path: '/manager/statistics', label: t('nav.statistics'), shortLabel: '📊', icon: statisticsIcon },
    ],
    ADMIN: [
      { path: '/admin/users', label: t('nav.users'), shortLabel: '👥', icon: patientIcon },
      { path: '/admin/doctors', label: t('nav.doctors'), shortLabel: '👨‍⚕️', icon: doctorIcon },
      { path: '/admin/receptionists', label: t('nav.receptionists'), shortLabel: '👩‍💼', icon: receptionistIcon },  
      { path: '/admin/hospitals', label: t('nav.hospitals'), shortLabel: '🏥', icon: doctorIcon },
      { path: '/admin/specialties', label: t('nav.specialties'), shortLabel: '📚', icon: findIcon },
    ],
    RECEPTIONIST: [
      { path: '/receptionist/statistics', label: t('nav.statistics'), shortLabel: '📊', icon: statisticsIcon },
    ],
  };

  const roleMenu = user?.role ? roleBasedItems[user.role] || [] : [];
  const menuItems = [...publicMenuItems, ...unauthenticatedMenuItems, ...privateMenuItems, ...roleMenu];

  // KIỂM TRA CÓ HIỂN THỊ MENU "APPLY" KHÔNG (CHỈ PATIENT MỚI THẤY)
  const showApplyMenu = user?.role === 'PATIENT';

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo + Brand */}
          <div className="flex-shrink-0">
            <Link to={isAuthenticated ? '/' : '/'} className="flex items-center gap-1.5 sm:gap-2 group">
              <img
                src={systemLogo}
                alt="Healthcare Connect"
                className="w-7 h-7 sm:w-9 sm:h-9 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <span className="text-sm sm:text-base md:text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-cyan-400 hidden sm:inline">
                {systemName}
              </span>
            </Link>
          </div>

          {/* Desktop Menu + Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <nav className="flex items-center gap-0.5 xl:gap-1">
              {menuItems.map((item) => {
                if (item.path === '/') {
                  return (
                    <button
                      key={item.path}
                      onClick={handleHomeClick}
                      className={`px-2 xl:px-3 py-1.5 xl:py-2 rounded-lg transition flex items-center gap-1 whitespace-nowrap text-sm xl:text-base ${isActive(item.path)
                        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      title={item.label}
                    >
                      <img src={item.icon} alt={item.label} className="w-5 h-5 object-contain" />

                      <span className={`${isLargeScreen ? 'inline' : 'hidden'} xl:inline`}>
                        {item.label}
                      </span>
                    </button>
                  );
                }
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-2 xl:px-3 py-1.5 xl:py-2 rounded-lg transition flex items-center gap-1 whitespace-nowrap text-sm xl:text-base ${isActive(item.path)
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    title={item.label}
                  >
                    {/* <span className="text-base xl:text-lg">{item.icon}</span> */}
                    <img src={item.icon} alt={item.label} className="w-5 h-5 object-contain" />
                    <span className={`${isLargeScreen ? 'inline' : 'hidden'} xl:inline`}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* User Actions */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-1 sm:gap-2 p-1 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden sm:inline text-gray-700 dark:text-gray-300 text-sm max-w-[100px] truncate">
                    {user?.fullName?.split(' ').pop()}
                  </span>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Profile - Desktop */}
                {isProfileDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsProfileDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 overflow-hidden">
                      {/* User Info */}
                      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{user?.fullName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{getRole(user?.role || '')}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">{user?.email}</p>
                      </div>

                      {/* PHẦN ĐĂNG KÝ - CHỈ HIỂN THỊ CHO PATIENT */}
                      {showApplyMenu && (
                        <div className="border-b border-gray-200 dark:border-gray-700">
                          <p className="px-4 pt-2 text-xs font-semibold text-gray-400 dark:text-gray-500">
                            {t('nav.apply').toUpperCase()}
                          </p>
                          <Link
                            to="/apply/doctor"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <span className="text-xl">👨‍⚕️</span>
                            <div>
                              <p className="font-medium">{t('nav.applyDoctor')}</p>
                              <p className="text-xs text-gray-400">{t('nav.applyDoctorDesc')}</p>
                            </div>
                          </Link>
                          <Link
                            to="/apply/receptionist"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <span className="text-xl">👩‍💼</span>
                            <div>
                              <p className="font-medium">{t('nav.applyReceptionist')}</p>
                              <p className="text-xs text-gray-400">{t('nav.applyReceptionistDesc')}</p>
                            </div>
                          </Link>
                          <Link
                            to="/apply/status"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition border-t border-gray-100 dark:border-gray-700"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <span className="text-xl">📋</span>
                            <div>
                              <p className="font-medium">{t('nav.trackApplication')}</p>
                              <p className="text-xs text-gray-400">{t('nav.trackApplicationDesc')}</p>
                            </div>
                          </Link>
                        </div>
                      )}

                      {/* Profile & Settings - Luôn hiển thị */}
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <span className="text-xl">👤</span>
                        <div>
                          <p className="font-medium">{t('profile.title')}</p>
                          <p className="text-xs text-gray-400">{t('profile.subtitle')}</p>
                        </div>
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <span className="text-xl">⚙️</span>
                        <div>
                          <p className="font-medium">{t('settings.title')}</p>
                          <p className="text-xs text-gray-400">{t('settings.appearance')}</p>
                        </div>
                      </Link>

                      {user?.role === 'ADMIN' && (
                        <>
                          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                          <Link
                            to="/admin/config"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <span className="text-xl">⚙️</span>
                            <div>
                              <p className="font-medium">{t('nav.systemConfig')}</p>
                              <p className="text-xs text-gray-400">{t('nav.systemConfigDesc')}</p>
                            </div>
                          </Link>
                        </>
                      )}

                      {/* Divider */}
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                      >
                        <span className="text-xl">🚪</span>
                        <div>
                          <p className="font-medium">{t('common.logout')}</p>
                          <p className="text-xs text-red-400">Đăng xuất khỏi hệ thống</p>
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to="/login" className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm">
                {t('common.login')}
              </Link>
            )}
          </div>

          {/* Mobile: User avatar + menu button */}
          <div className="flex lg:hidden items-center gap-2">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm"
                >
                  {user?.fullName?.charAt(0) || 'U'}
                </button>

                {/* Dropdown Profile - Mobile */}
                {isProfileDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsProfileDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 overflow-hidden">
                      {/* User Info */}
                      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{user?.fullName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{getRole(user?.role || '')}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">{user?.email}</p>
                      </div>

                      {/* PHẦN ĐĂNG KÝ - CHỈ HIỂN THỊ CHO PATIENT */}
                      {showApplyMenu && (
                        <div className="border-b border-gray-200 dark:border-gray-700">
                          <p className="px-4 pt-2 text-xs font-semibold text-gray-400 dark:text-gray-500">
                            {t('nav.apply').toUpperCase()}
                          </p>
                          <Link
                            to="/apply/doctor"
                            className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <span className="text-xl">👨‍⚕️</span>
                            <span>{t('nav.applyDoctor')}</span>
                          </Link>
                          <Link
                            to="/apply/receptionist"
                            className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <span className="text-xl">👩‍💼</span>
                            <span>{t('nav.applyReceptionist')}</span>
                          </Link>
                          <Link
                            to="/apply/status"
                            className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition border-t border-gray-100 dark:border-gray-700"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <span className="text-xl">📋</span>
                            <span>{t('nav.trackApplication')}</span>
                          </Link>
                        </div>
                      )}

                      <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition" onClick={() => setIsProfileDropdownOpen(false)}>
                        <span className="text-xl">👤</span>
                        <span>{t('nav.profile')}</span>
                      </Link>
                      <Link to="/settings" className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition" onClick={() => setIsProfileDropdownOpen(false)}>
                        <span className="text-xl">⚙️</span>
                        <span>{t('nav.settings')}</span>
                      </Link>
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                        <span className="text-xl">🚪</span>
                        <span>{t('common.logout')}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to="/login" className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm">Login</Link>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-gray-200 dark:border-gray-700 max-h-[70vh] overflow-y-auto">
            {menuItems.map((item) => {
              if (item.path === '/') {
                return (
                  <button
                    key={item.path}
                    onClick={(e) => {
                      handleHomeClick(e);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition w-full text-left ${isActive(item.path)
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              }
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${isActive(item.path)
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
            {!user && (
              <Link
                to="/login"
                className="flex items-center gap-2 px-3 py-2 mt-2 text-blue-600 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                🔐 {t('common.login')}
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;