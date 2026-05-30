/**
 * Lấy đường dẫn ảnh từ public folder
 * @param path - Đường dẫn tương đối trong thư mục public/
 * @returns Đường dẫn đầy đủ
 */
export const getImageUrl = (path: string): string => {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${cleanBase}/${cleanPath}`;
};

// ==================== Hình ảnh trong project ====================

export const images = {
  // Layout & Common
  logo: () => getImageUrl('images/hospital_logo.png'),
  
  // Navigation Icons
  home: () => getImageUrl('images/home.png'),
  phone: () => getImageUrl('images/phone-call.png'),
  doctor: () => getImageUrl('images/doctor.png'),
  patient: () => getImageUrl('images/patient.png'),
  schedule: () => getImageUrl('images/schedule.png'),
  statistics: () => getImageUrl('images/statistics.png'),
  review: () => getImageUrl('images/review.png'),
  room: () => getImageUrl('images/room.png'),
  receptionist: () => getImageUrl('images/receptionist.png'),
  clock: () => getImageUrl('images/clock.png'),
  specialties: () => getImageUrl('images/specialties.png'),
  
  // Action Icons
  find: () => getImageUrl('images/find.png'),
  booking: () => getImageUrl('images/booking.png'),
  healthcare: () => getImageUrl('images/healthcare.png'),
  dashboard: () => getImageUrl('images/dashboard.png'),
  register: () => getImageUrl('images/register.png'),
  appointment: () => getImageUrl('images/medical-appointment.png'),
  quickPayment: () => getImageUrl('images/quick_payment.png'),
  complain: () => getImageUrl('images/complain.png'),
  
  // Social Icons
  facebook: () => getImageUrl('images/facebook.png'),
  zalo: () => getImageUrl('images/zalo.png'),
  youtube: () => getImageUrl('images/youtube.png'),
  tiktok: () => getImageUrl('images/tik-tok.png'),
  messenger: () => getImageUrl('images/messenger.png'),
  
  // Contact Icons
  location: () => getImageUrl('images/location.png'),
  email: () => getImageUrl('images/email.png'),
  time: () => getImageUrl('images/clock.png'),
  
  // Page Icons
  about: () => getImageUrl('images/about.png'),
  privacyPolicy: () => getImageUrl('images/privacy_policy.png'),
  terms: () => getImageUrl('images/services.png'),
  
  // Home Page Images
  banner1: () => getImageUrl('images/banner1.jpg'),
  banner2: () => getImageUrl('images/banner2.jpg'),
  banner3: () => getImageUrl('images/banner3.jpg'),
  
  // Fallback
  default: () => getImageUrl('images/hospital_logo.png'),
};

// Helper để lấy ảnh với fallback
export const getImageWithFallback = (imagePath?: string, fallbackPath?: string): string => {
  if (imagePath && imagePath.startsWith('http')) return imagePath;
  return imagePath || fallbackPath || images.default();
};