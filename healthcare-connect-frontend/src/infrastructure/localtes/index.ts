import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import vi from './vi.json';
import en from './en.json';

const savedLanguage = localStorage.getItem('language');
const browserLanguage = navigator.language.split('-')[0];
const defaultLanguage = savedLanguage || (browserLanguage === 'vi' ? 'vi' : 'en');

i18n
  .use(initReactI18next)
  .init({
    resources: {
      vi: { translation: vi },
      en: { translation: en },
    },
    lng: defaultLanguage,
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false,
    },
  });

// Đổi ngôn ngữ
export const changeLanguage = (lang: 'vi' | 'en') => {
  i18n.changeLanguage(lang);
  localStorage.setItem('language', lang);
};

// Lấy error message từ errorKey (BE trả về)
export const getErrorMessage = (errorKey: string): string => {
  if (!errorKey) return i18n.t('error.UNCATEGORIZED_EXCEPTION');
  
  const message = i18n.t(`error.${errorKey}`);
  
  // Nếu không tìm thấy key trong file json
  if (message === `error.${errorKey}`) {
    return i18n.t('error.UNCATEGORIZED_EXCEPTION');
  }
  
  return message;
};

export default i18n;