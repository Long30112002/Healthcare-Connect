import axios from 'axios';
import { getErrorMessage } from '../localtes';
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Lấy errorKey từ response của BE
    const errorKey = error.response?.data?.errorKey;

    if (errorKey) {
      const translatedMessage = getErrorMessage(errorKey);
      if (error.response?.data) {
        error.response.data.message = translatedMessage;
      }
    }

    // Chỉ xử lý redirect khi 401 Unauthorized
    if (error.response?.status === 401) {
      const isLoginPage = window.location.pathname === '/login';
      if (!isLoginPage) {
        window.dispatchEvent(new CustomEvent('unauthorized'));
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;