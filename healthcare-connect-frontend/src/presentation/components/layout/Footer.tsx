import { Link } from 'react-router-dom';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';

const Footer = () => {
  const { t } = useAppTranslation();
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { path: '/about', label: t('footer.aboutUs'), icon: '🏥' },
    { path: '/privacy-policy', label: t('footer.privacyPolicy'), icon: '🔒' },
    { path: '/terms-of-service', label: t('footer.termsOfService'), icon: '📜' },
    { path: '/contact', label: t('footer.contact'), icon: '📞' },
  ];

  const socialLinks = [
    { name: 'Facebook', url: 'https://facebook.com', icon: '📘', color: 'hover:text-blue-600' },
    { name: 'Zalo', url: 'https://zalo.me', icon: '💬', color: 'hover:text-blue-500' },
    { name: 'YouTube', url: 'https://youtube.com', icon: '📺', color: 'hover:text-red-600' },
    { name: 'TikTok', url: 'https://tiktok.com', icon: '🎵', color: 'hover:text-black' },
  ];

  const contactInfo = [
    { icon: '📍', text: t('footer.address'), value: '123 Đường Nguyễn Huệ, Quận 1, TP.HCM' },
    { icon: '📞', text: t('footer.hotline'), value: '1900 1234' },
    { icon: '✉️', text: t('footer.email'), value: 'support@healthcareconnect.vn' },
    { icon: '🕒', text: t('footer.workingHours'), value: 'Thứ 2 - Thứ 7: 8:00 - 20:00' },
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
                src="/src/presentation/assets/images/hospital_logo.png"
                alt="Healthcare Connect"
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Healthcare Connect
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              {t('footer.description')}
            </p>
          
          </div>

          {/* Column 2: Quick Links */}
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
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              {t('footer.contactInfo')}
            </h3>
            <ul className="space-y-3">
              {contactInfo.map((info, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-400">
                  <span className="mt-0.5">{info.icon}</span>
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
                  className={`w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-xl transition-all duration-200 ${social.color} hover:scale-110 hover:bg-gray-700`}
                  title={social.name}
                >
                  {social.icon}
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
              © {currentYear} Healthcare Connect. {t('footer.copyright')}
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