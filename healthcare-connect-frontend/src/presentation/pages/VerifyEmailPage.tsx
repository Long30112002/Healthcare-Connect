import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '../../infrastructure/api/authApi';
import LoadingSpinner from '../../presentation/components/shared/LoadingSpinner';

const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const code = searchParams.get('code');

    useEffect(() => {
        if (!code) {
            navigate('/login?error=invalid_code');
            return;
        }

        const verifyEmail = async () => {
            try {
                await authApi.verifyEmail(code);
                navigate('/login?verified=true');
            } catch (err) {
                navigate('/login?error=verification_failed');
            }
        };
        
        verifyEmail();
    }, [code, navigate]);

    return <LoadingSpinner fullScreen variant="dots" text="Đang xác thực email..." />;
};

export default VerifyEmailPage;