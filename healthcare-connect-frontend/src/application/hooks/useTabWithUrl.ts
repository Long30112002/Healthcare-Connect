import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface UseTabWithUrlOptions<T extends string> {
    paramName: string;
    validValues: T[];
    defaultValue: T;
    includePage?: boolean; 
    pageZeroBased?: boolean;
}

interface UseTabWithUrlReturn<T extends string> {
    activeTab: T;
    setActiveTab: (tab: T) => void;
    page?: number;          
    setPage?: (page: number) => void; 
    apiPage?: number;    
}

export const useTabWithUrl = <T extends string>({
    paramName,
    validValues,
    defaultValue,
    includePage = true, 
    pageZeroBased = true
}: UseTabWithUrlOptions<T>): UseTabWithUrlReturn<T> => {
    const navigate = useNavigate();
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    
    const getTabFromUrl = (): T => {
        const tab = searchParams.get(paramName) as T;
        return tab && validValues.includes(tab) ? tab : defaultValue;
    };
    
    const getPageFromUrl = (): number => {
        if (!includePage) return pageZeroBased ? 0 : 1;
        const pageParam = searchParams.get('page');
        const defaultPage = pageZeroBased ? 0 : 1;
        if (!pageParam) return defaultPage;
        const page = parseInt(pageParam);
        return isNaN(page) || page < (pageZeroBased ? 0 : 1) ? defaultPage : page;
    };

    const [activeTab, setActiveTabState] = useState<T>(getTabFromUrl);
    const [page, setPageState] = useState<number>(getPageFromUrl);

    const updateUrl = (tab: T, newPage: number) => {
        const params = new URLSearchParams();
        params.set(paramName, tab);
        if (includePage) {
            params.set('page', newPage.toString());
        }
        navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    };

    const setActiveTab = (tab: T) => {
        const defaultPage = pageZeroBased ? 0 : 1;
        setActiveTabState(tab);
        if (includePage) {
            setPageState(defaultPage);
            updateUrl(tab, defaultPage);
        } else {
            updateUrl(tab, 0);
        }
    };

    const setPage = (newPage: number) => {
        if (!includePage) return;
        const minPage = pageZeroBased ? 0 : 1;
        if (newPage < minPage) return;
        setPageState(newPage);
        updateUrl(activeTab, newPage);
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get(paramName) as T;
        const pageParam = params.get('page');
        
        if (tab && validValues.includes(tab) && tab !== activeTab) {
            setActiveTabState(tab);
        }
        
        if (includePage && pageParam) {
            const newPage = parseInt(pageParam);
            const minPage = pageZeroBased ? 0 : 1;
            if (!isNaN(newPage) && newPage !== page && newPage >= minPage) {
                setPageState(newPage);
            }
        }
    }, [location.search]);

    const apiPage = includePage ? (pageZeroBased ? page : page - 1) : undefined;

    return {
        activeTab,
        setActiveTab,
        page: includePage ? page : undefined,
        setPage: includePage ? setPage : undefined,
        apiPage
    };
};