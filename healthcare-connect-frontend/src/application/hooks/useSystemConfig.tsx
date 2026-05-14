import { useEffect, useState } from 'react';
import { configApi } from '../../infrastructure/api/configApi';

export const useSystemConfig = () => {
    const [configs, setConfigs] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConfigs = async () => {
            try {
                const data = await configApi.getAllConfigs();
                setConfigs(data);
            } catch (error) {
                console.error('Failed to load configs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchConfigs();
    }, []);

    return { configs, loading };
};