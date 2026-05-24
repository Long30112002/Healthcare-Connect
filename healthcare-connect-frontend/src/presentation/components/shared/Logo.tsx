import { useSystemConfig } from '../../../application/hooks/useSystemConfig';
import defaultLogo from '../../assets/images/hospital_logo.png';

interface LogoProps {
    className?: string;
}

const Logo = ({ className = "w-12 h-12 object-contain" }: LogoProps) => {
    const { configs } = useSystemConfig();
    const systemLogo = configs.SYSTEM_LOGO_URL || defaultLogo;

    return (
        <img
            src={systemLogo}
            alt="Healthcare Connect Logo"
            className={className}
            onError={(e) => {
                (e.target as HTMLImageElement).src = defaultLogo;
            }}
        />
    );
};

export default Logo;