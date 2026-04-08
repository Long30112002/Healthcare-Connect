import { useTranslation } from 'react-i18next';
import { changeLanguage, getErrorMessage } from '../../infrastructure/localtes';

export const useAppTranslation = () => {
  const { t, i18n } = useTranslation();
  
  return {
    // Hàm translate cơ bản
    t,
    
    // Instance i18n
    i18n,
    
    // Ngôn ngữ hiện tại
    currentLanguage: i18n.language,
    
    // Đổi ngôn ngữ (vi/en)
    changeLanguage,
    
    // Lấy error message từ errorKey (từ BE)
    getError: getErrorMessage,
    
    // Lấy text common (button, label...)
    getCommon: (path: string) => t(`common.${path}`),
    
    // Lấy tên role theo key
    getRole: (role: string) => t(`role.${role}`),
    
    // Lấy text status theo key
    getStatus: (status: string) => t(`status.${status}`),
    
    // Lấy text theo page (ví dụ: page.login.title)
    getPageText: (page: string, path: string) => t(`page.${page}.${path}`),
  };
};