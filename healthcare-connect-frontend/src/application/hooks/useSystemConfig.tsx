import { useEffect, useState } from 'react';
import { configApi } from '../../infrastructure/api/configApi';

export const useSystemConfig = () => {
    const [configs, setConfigs] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConfigs = async () => {
            try {
                const data = await configApi.getAllConfigs();
                // Đảm bảo data là object, nếu không thì set object rỗng
                setConfigs(data && typeof data === 'object' ? data : {});
            } catch (error) {
                console.error('Failed to load configs:', error);
                setConfigs({});
            } finally {
                setLoading(false);
            }
        };
        fetchConfigs();
    }, []);

    return { configs, loading };
};