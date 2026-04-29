import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface UseTabWithUrlOptions<T extends string> {
    paramName: string;
    validValues: T[];
    defaultValue: T;
    pageZeroBased?: boolean;  // 🟢 THÊM DÒNG NÀY
}

interface UseTabWithUrlReturn<T extends string> {
    activeTab: T;
    setActiveTab: (tab: T) => void;
    page: number;
    setPage: (page: number) => void;
    apiPage: number;
}

export const useTabWithUrl = <T extends string>({
    paramName,
    validValues,
    defaultValue,
    pageZeroBased = true  // 🟢 THÊM DÒNG NÀY, mặc định là true (bắt đầu từ 0)
}: UseTabWithUrlOptions<T>): UseTabWithUrlReturn<T> => {
    const navigate = useNavigate();
    const location = useLocation();

    // Parse URL params
    const searchParams = new URLSearchParams(location.search);
    
    const getTabFromUrl = (): T => {
        const tab = searchParams.get(paramName) as T;
        return tab && validValues.includes(tab) ? tab : defaultValue;
    };
    
    const getPageFromUrl = (): number => {
        const pageParam = searchParams.get('page');
        const defaultPage = pageZeroBased ? 0 : 1;
        if (!pageParam) return defaultPage;
        const page = parseInt(pageParam);
        return isNaN(page) || page < (pageZeroBased ? 0 : 1) ? defaultPage : page;
    };

    const [activeTab, setActiveTabState] = useState<T>(getTabFromUrl);
    const [page, setPageState] = useState<number>(getPageFromUrl);

    // Cập nhật URL khi state thay đổi
    const updateUrl = (tab: T, newPage: number) => {
        const params = new URLSearchParams();
        params.set(paramName, tab);
        params.set('page', newPage.toString());
        navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    };

    // Set tab và update URL (reset page về mặc định)
    const setActiveTab = (tab: T) => {
        const defaultPage = pageZeroBased ? 0 : 1;
        setActiveTabState(tab);
        setPageState(defaultPage);
        updateUrl(tab, defaultPage);
    };

    // Set page và update URL
    const setPage = (newPage: number) => {
        const minPage = pageZeroBased ? 0 : 1;
        if (newPage < minPage) return;
        setPageState(newPage);
        updateUrl(activeTab, newPage);
    };

    // Lắng nghe URL thay đổi (back/forward)
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get(paramName) as T;
        const pageParam = params.get('page');
        
        if (tab && validValues.includes(tab) && tab !== activeTab) {
            setActiveTabState(tab);
        }
        
        if (pageParam) {
            const newPage = parseInt(pageParam);
            const minPage = pageZeroBased ? 0 : 1;
            if (!isNaN(newPage) && newPage !== page && newPage >= minPage) {
                setPageState(newPage);
            }
        }
    }, [location.search]);

    // API page = page - 1 (nếu pageZeroBased = false) hoặc page (nếu pageZeroBased = true)
    const apiPage = pageZeroBased ? page : page - 1;

    return {
        activeTab,
        setActiveTab,
        page,
        setPage,
        apiPage
    };
};