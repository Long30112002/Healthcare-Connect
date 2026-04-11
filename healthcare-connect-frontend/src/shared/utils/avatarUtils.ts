export const getAvatarUrl = (name: string, _specialty?: string): string => {
    const encodedName = encodeURIComponent(name);
    return `https://ui-avatars.com/api/?name=${encodedName}&background=0D8ABC&color=fff&bold=true&rounded=true&size=80`;
};

// Lấy icon theo specialty
export const getSpecialtyIcon = (specialty: string): string => {
    const icons: Record<string, string> = {
        'Tim mạch': '❤️',
        'Nhi khoa': '👶',
        'Nội tổng hợp': '🩺',
        'Da liễu': '🧴',
        'Xét nghiệm nội tạng': '🔬',
        'default': '👨‍⚕️'
    };
    return icons[specialty] || icons.default;
};

export const getSpecialtyGradient = (specialty: string): string => {
    const gradients: Record<string, string> = {
        'Tim mạch': 'from-red-500 to-pink-500',
        'Nhi khoa': 'from-green-500 to-teal-500',
        'Nội tổng hợp': 'from-blue-500 to-cyan-500',
        'Da liễu': 'from-purple-500 to-indigo-500',
        'Xét nghiệm nội tạng': 'from-orange-500 to-yellow-500',
        'default': 'from-gray-500 to-gray-600'
    };
    return gradients[specialty] || gradients.default;
};