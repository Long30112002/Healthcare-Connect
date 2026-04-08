import { useAppTranslation } from '../../../application/hooks/useAppTranslation';

interface LanguageToggleProps {
  variant?: 'light' | 'dark' | 'auto';
}

const LanguageToggle = ({ variant = 'auto' }: LanguageToggleProps) => {
  const { currentLanguage, changeLanguage } = useAppTranslation();
  
  const getStyles = () => {
    if (variant === 'light') {
      return {
        container: 'bg-gray-100 border border-gray-200',
        active: 'bg-white text-blue-700 shadow-sm',
        inactive: 'text-gray-600 hover:bg-gray-200',
      };
    }
    if (variant === 'dark') {
      return {
        container: 'bg-gray-800 border border-gray-700',
        active: 'bg-blue-600 text-white shadow-sm',
        inactive: 'text-gray-400 hover:bg-gray-700',
      };
    }
    return {
      container: 'bg-white/10 backdrop-blur-md border border-white/20',
      active: 'bg-white text-blue-800 shadow-md',
      inactive: 'text-white/80 hover:bg-white/10',
    };
  };

  const styles = getStyles();

  const Flag = ({ code }: { code: 'vi' | 'en' }) => {
    if (code === 'vi') {
      return (
        <svg className="w-4 h-3 rounded-sm shadow-sm" viewBox="0 0 512 512">
          <rect width="512" height="512" fill="#da251d"/>
          <polygon fill="#ff0" points="256,110 286,202 383,202 305,259 334,351 256,294 178,351 207,259 129,202 226,202"/>
        </svg>
      );
    }
    return (
      <svg className="w-4 h-3 rounded-sm shadow-sm" viewBox="0 0 640 480">
        <path fill="#012169" d="M0 0h640v480H0z"/>
        <path fill="#fff" d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-74L320 299 75 480H0v-65l238-176L0 61V0h75z"/>
        <path fill="#C8102E" d="m424 281 216 159v40L369 281h55zM216 199 0 38v40l161 121h55zm254 0 170-126V35L415 199h55zM161 281 0 401v41l216-161h-55z"/>
        <path fill="#fff" d="M256 0h128v480H256zM0 176h640v128H0z"/>
        <path fill="#C8102E" d="M288 0h64v480h-64zM0 208h640v64H0z"/>
      </svg>
    );
  };

  return (
    <div className={`inline-flex items-center gap-1 rounded-full p-1 transition-all ${styles.container}`}>
      <button
        onClick={() => changeLanguage('vi')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${
          currentLanguage === 'vi' ? styles.active : styles.inactive
        }`}
      >
        <Flag code="vi" />
        <span>VI</span>
      </button>

      <button
        onClick={() => changeLanguage('en')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${
          currentLanguage === 'en' ? styles.active : styles.inactive
        }`}
      >
        <Flag code="en" />
        <span>EN</span>
      </button>
    </div>
  );
};

export default LanguageToggle;