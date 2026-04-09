import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../../infrastructure/api/authApi';
import LoadingSpinner from '../components/shared/LoadingSpinner';

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
                const response = await authApi.verifyEmail(code);
                if (response.data.code === 200 || response.data.status === 'success') {
                    navigate('/login?verified=true');
                } else {
                    navigate('/login?error=verification_failed');
                }
            } catch (err) {
                navigate('/login?error=verification_failed');
            }
        };
        verifyEmail();
    }, [code, navigate]);
    return <LoadingSpinner />;
};

export default VerifyEmailPage;