import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../application/context/AuthContext';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { t, getRole } = useAppTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(true);

  useEffect(() => {
    const checkScreen = () => {
      setIsLargeScreen(window.innerWidth >= 1280);
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  const handleLogout = async () => {
    setIsProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
    await logout();
  };

  const isActive = (path: string) => {
    const currentPath = location.pathname;
    if (path === '/') {
      return currentPath === '/' || currentPath === '/dashboard';
    }
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  const publicMenuItems = !isAuthenticated ? [
    { path: '/', label: t('nav.home'), shortLabel: '🏠', icon: '🏠' },
    { path: '/doctors/public', label: t('nav.doctors'), shortLabel: '👨‍⚕️', icon: '👨‍⚕️' },
    { path: '/contact', label: t('nav.contact'), shortLabel: '📞', icon: '📞' },
  ] : [
    { path: '/', label: t('nav.home'), shortLabel: '🏠', icon: '🏠' },
    { path: '/contact', label: t('nav.contact'), shortLabel: '📞', icon: '📞' },
  ];

  const privateMenuItems = user ? [
    { path: '/appointments', label: t('nav.appointments'), shortLabel: '📋', icon: '📋' },
  ] : [];

  const roleBasedItems: Record<string, typeof publicMenuItems> = {
    PATIENT: [
      { path: '/doctors', label: t('nav.findDoctors'), shortLabel: '🔍', icon: '🔍' },
      { path: '/my-health', label: t('nav.myHealth'), shortLabel: '💊', icon: '💊' },
    ],  
    DOCTOR: [
      { path: '/my-schedule', label: t('nav.schedule'), shortLabel: '📅', icon: '📅' },
      { path: '/my-patients', label: t('nav.patients'), shortLabel: '👥', icon: '👥' },
    ],
    HOSPITAL_MANAGER: [
      { path: '/manage-doctors', label: 'Quản lý BS', shortLabel: '📋', icon: '👨‍⚕️' },
      { path: '/hospital-dashboard', label: 'BV của tôi', shortLabel: '🏥', icon: '🏥' },
    ],
    ADMIN: [
      { path: '/admin/users', label: 'Users', shortLabel: '👥', icon: '👥' },
      { path: '/admin/hospitals', label: 'BV', shortLabel: '🏥', icon: '🏥' },
      { path: '/admin/specialties', label: 'CK', shortLabel: '📚', icon: '📚' },
    ],
  };

  const roleMenu = user?.role ? roleBasedItems[user.role] || [] : [];
  const menuItems = [...publicMenuItems, ...privateMenuItems, ...roleMenu];

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Layout 2 cột đơn giản hơn: Logo trái - Menu + Actions phải */}
        <div className="flex items-center justify-between h-14 sm:h-16">

          {/* Logo + Brand (Bên trái) */}
          <div className="flex-shrink-0">
            <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-1.5 sm:gap-2 group">
              <img
                src="/src/presentation/assets/images/hospital_logo.png"
                alt="Healthcare Connect"
                className="w-7 h-7 sm:w-9 sm:h-9 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <span className="text-sm sm:text-base md:text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-cyan-400 hidden sm:inline">
                Healthcare Connect
              </span>
            </Link>
          </div>

          {/* Desktop Menu + Actions (Bên phải) */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Menu items */}
            <nav className="flex items-center gap-0.5 xl:gap-1">
              {menuItems.map((item) => {
                // Xử lý riêng cho Home (path === '/')
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
                      <span className="text-base xl:text-lg">{item.icon}</span>
                      <span className={`${isLargeScreen ? 'inline' : 'hidden'} xl:inline`}>
                        {item.label}
                      </span>
                    </button>
                  );
                }

                // Các item khác
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
                    <span className="text-base xl:text-lg">{item.icon}</span>
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

                {isProfileDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsProfileDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 overflow-hidden">
                      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{user?.fullName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{getRole(user?.role || '')}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">{user?.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {t('nav.profile')}
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {t('nav.settings')}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {t('common.logout')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm"
              >
                {t('common.login')}
              </Link>
            )}
          </div>

          {/* Mobile: Chỉ hiển thị user avatar + menu button */}
          <div className="flex lg:hidden items-center gap-2">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm"
                >
                  {user?.fullName?.charAt(0) || 'U'}
                </button>
                {/* Dropdown giống như trên desktop */}
                {isProfileDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsProfileDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 overflow-hidden">
                      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{user?.fullName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{getRole(user?.role || '')}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">{user?.email}</p>
                      </div>
                      <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition" onClick={() => setIsProfileDropdownOpen(false)}>👤 {t('nav.profile')}</Link>
                      <Link to="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition" onClick={() => setIsProfileDropdownOpen(false)}>⚙️ {t('nav.settings')}</Link>
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition">🚪 {t('common.logout')}</button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to="/login" className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm">Login</Link>
            )}

            {/* Mobile Menu Button */}
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

        {/* Mobile Menu - Hiển thị khi click menu button */}
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