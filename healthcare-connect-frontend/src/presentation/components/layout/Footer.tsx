import { Link } from 'react-router-dom';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import { configApi } from '../../../infrastructure/api/configApi';
import { useEffect, useState } from 'react';
import tiktok from '../../assets/images/tik-tok.png';
import zalo from '../../assets/images/zalo.png';
import youtube from '../../assets/images/youtube.png';
import facebook from '../../assets/images/facebook.png';
// Import icon cho contact
import locationIcon from '../../assets/images/location.png';
import phoneIcon from '../../assets/images/phone-call.png';
import emailIcon from '../../assets/images/email.png';
import clockIcon from '../../assets/images/clock.png';
// Import icon cho quick links
import aboutIcon from '../../assets/images/about.png';
import privacyPolicyIcon from '../../assets/images/privacy_policy.png';
import termsIcon from '../../assets/images/services.png';

const Footer = () => {
  const { t } = useAppTranslation();
  const currentYear = new Date().getFullYear();
  
  const [configs, setConfigs] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const data = await configApi.getAllConfigs();
        setConfigs(data);
      } catch (error) {
        console.error('Failed to load footer configs:', error);
      }
    };
    fetchConfigs();
  }, []);

  const systemLogo = configs.SYSTEM_LOGO_URL || '/src/presentation/assets/images/hospital_logo.png';
  const systemName = configs.SYSTEM_NAME || 'Healthcare Connect';
  const footerDescription = configs.FOOTER_DESCRIPTION || t('footer.description');
  const footerCopyright = configs.FOOTER_COPYRIGHT || t('footer.copyright');
  
  const contactPhone = configs.CONTACT_PHONE || '1900 1234';
  const contactEmail = configs.CONTACT_EMAIL || 'support@healthcareconnect.vn';
  const contactAddress = configs.CONTACT_ADDRESS || '123 Đường Nguyễn Huệ, Quận 1, TP.HCM';
  
  const socialFacebook = configs.SOCIAL_FACEBOOK || 'https://facebook.com';
  const socialZalo = configs.SOCIAL_ZALO || 'https://zalo.me';
  const socialYoutube = configs.SOCIAL_YOUTUBE || 'https://youtube.com';
  const socialTiktok = configs.SOCIAL_TIKTOK || 'https://tiktok.com';

  // Quick Links - dùng ảnh
  const quickLinks = [
    { path: '/about', label: t('footer.aboutUs'), icon: aboutIcon },
    { path: '/privacy-policy', label: t('footer.privacyPolicy'), icon: privacyPolicyIcon },
    { path: '/terms-of-service', label: t('footer.termsOfService'), icon: termsIcon },
    { path: '/contact', label: t('footer.contact'), icon: phoneIcon },
  ];

  const socialLinks = [
    { name: 'Facebook', url: socialFacebook, icon: facebook, color: 'hover:opacity-80' },
    { name: 'Zalo', url: socialZalo, icon: zalo, color: 'hover:opacity-80' },
    { name: 'YouTube', url: socialYoutube, icon: youtube, color: 'hover:opacity-80' },
    { name: 'TikTok', url: socialTiktok, icon: tiktok, color: 'hover:opacity-80' },
  ];

  // Contact Info - dùng ảnh
  const contactInfo = [
    { icon: locationIcon, text: t('footer.address'), value: contactAddress },
    { icon: phoneIcon, text: t('footer.hotline'), value: contactPhone },
    { icon: emailIcon, text: t('footer.email'), value: contactEmail },
    { icon: clockIcon, text: t('footer.workingHours'), value: 'Thứ 2 - Thứ 7: 8:00 - 20:00' },
  ];

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 mt-auto">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Column 1: Brand & Description */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img
                src={systemLogo}
                alt="Healthcare Connect"
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {systemName}
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              {footerDescription}
            </p>
          </div>

          {/* Column 2: Quick Links - Dùng ảnh */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-white transition flex items-center gap-2"
                  >
                    <img 
                      src={link.icon} 
                      alt={link.label}
                      className="w-5 h-5 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Info - Dùng ảnh */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              {t('footer.contactInfo')}
            </h3>
            <ul className="space-y-3">
              {contactInfo.map((info, index) => (
                <li key={index} className="flex items-start gap-3 text-sm text-gray-400">
                  <img 
                    src={info.icon} 
                    alt={info.text}
                    className="w-5 h-5 object-contain mt-0.5"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <span>
                    <strong className="text-gray-300">{info.text}:</strong> {info.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Social & Newsletter */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              {t('footer.followUs')}
            </h3>
            <div className="flex gap-3 mb-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center transition-all duration-200 ${social.color} hover:scale-110 hover:bg-gray-700`}
                  title={social.name}
                >
                  <img
                    src={social.icon}
                    alt={social.name}
                    className="w-5 h-5 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </a>
              ))}
            </div>

            {/* Newsletter Signup */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">
                {t('footer.newsletter')}
              </h4>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder={t('footer.yourEmail')}
                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition">
                  {t('footer.subscribe')}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {t('footer.newsletterNote')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-gray-500">
            <p>
              © {currentYear} {systemName}. {footerCopyright}
            </p>
            <div className="flex gap-4">
              <Link to="/sitemap" className="hover:text-white transition">
                {t('footer.sitemap')}
              </Link>
              <Link to="/accessibility" className="hover:text-white transition">
                {t('footer.accessibility')}
              </Link>
              <Link to="/cookies" className="hover:text-white transition">
                {t('footer.cookies')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;