import { useSystemConfig } from '../../../application/hooks/useSystemConfig';
import { images } from '../../../shared/utils/imageUtils';

interface LogoProps {
    className?: string;
}

const Logo = ({ className = "w-12 h-12 object-contain" }: LogoProps) => {
    const { configs } = useSystemConfig();
    const systemLogo = configs?.SYSTEM_LOGO_URL || images.logo();

    return (
        <img
            src={systemLogo}
            alt="Healthcare Connect Logo"
            className={className}
            onError={(e) => {
                (e.target as HTMLImageElement).src = images.logo();
            }}
        />
    );
};

export default Logo;