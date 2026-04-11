import { useState } from 'react';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';

const FloatingChatbot = () => {
    const { t, currentLanguage } = useAppTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([
        { text: currentLanguage === 'vi' ? 'Xin chào! Tôi có thể giúp gì cho bạn?' : 'Hello! How can I help you?', isUser: false }
    ]);
    const [inputMessage, setInputMessage] = useState('');

    const handleSendMessage = () => {
        if (!inputMessage.trim()) return;

        // Thêm tin nhắn của user
        setMessages(prev => [...prev, { text: inputMessage, isUser: true }]);

        // Giả lập phản hồi (sau này thay bằng gọi API AI)
        setTimeout(() => {
            const autoReply = currentLanguage === 'vi'
                ? 'Cảm ơn bạn! Tôi sẽ hỗ trợ bạn sớm nhất có thể. 🚀'
                : 'Thank you! I will support you as soon as possible. 🚀';
            setMessages(prev => [...prev, { text: autoReply, isUser: false }]);
        }, 500);

        setInputMessage('');
    };

    return (
        <>
            {/* Chatbot Button */}
            <div
                className="fixed bottom-6 right-6 z-50 cursor-pointer group"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
            >
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className={`
            w-14 h-14 md:w-16 md:h-16 rounded-full 
            bg-gradient-to-r from-blue-500 to-cyan-500 
            shadow-lg hover:shadow-xl 
            flex items-center justify-center
            transition-all duration-300
            ${isHovering ? 'scale-110' : 'scale-100'}
          `}
                >
                    {/* Robot Icon */}
                    <div className="relative">
                        <span className="text-3xl md:text-4xl">🤖</span>
                        {/* Wave effect khi hover */}
                        {isHovering && (
                            <div className="absolute -top-2 -right-2 animate-wave">
                                <span className="text-xl">👋</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tooltip khi hover */}
                {isHovering && !isOpen && (
                    <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-800 text-white text-sm rounded-lg whitespace-nowrap shadow-lg animate-fade-in">
                        {currentLanguage === 'vi' ? '👋 Chào bạn! Nhấn để hỏi tôi nhé!' : '👋 Hi! Click to chat with me!'}
                    </div>
                )}
            </div>

            {/* Chat Modal */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Chat Box */}
                    <div className="fixed bottom-24 right-6 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 animate-slide-up overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">🤖</span>
                                    <div>
                                        <h3 className="font-semibold">
                                            {currentLanguage === 'vi' ? 'Trợ lý ảo Healthcare' : 'Healthcare Assistant'}
                                        </h3>
                                        <p className="text-xs text-blue-100">
                                            {currentLanguage === 'vi' ? 'Online • Sẵn sàng hỗ trợ' : 'Online • Ready to help'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="hover:bg-white/20 rounded-full p-1 transition"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="h-96 overflow-y-auto p-4 space-y-3">
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl ${msg.isUser
                                                ? 'bg-blue-500 text-white rounded-br-none'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none'
                                            }`}
                                    >
                                        <p className="text-sm">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Quick Questions */}
                        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {[
                                    currentLanguage === 'vi' ? 'Cách đặt lịch khám?' : 'How to book appointment?',
                                    currentLanguage === 'vi' ? 'Phí khám bao nhiêu?' : 'Consultation fee?',
                                    currentLanguage === 'vi' ? 'Hủy lịch thế nào?' : 'How to cancel?',
                                ].map((question, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setMessages(prev => [...prev, { text: question, isUser: true }]);
                                            setTimeout(() => {
                                                const reply = currentLanguage === 'vi'
                                                    ? 'Tôi sẽ hướng dẫn bạn chi tiết qua email! Vui lòng để lại thông tin. 📧'
                                                    : 'I will guide you in detail via email! Please leave your information. 📧';
                                                setMessages(prev => [...prev, { text: reply, isUser: false }]);
                                            }, 500);
                                        }}
                                        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs whitespace-nowrap hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                                    >
                                        {question}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder={currentLanguage === 'vi' ? 'Nhập câu hỏi...' : 'Type your question...'}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
                                >
                                    📤
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <style>{`
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          75% { transform: rotate(-20deg); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-wave {
          animation: wave 0.5s ease-in-out 2;
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
        </>
    );
};

export default FloatingChatbot;