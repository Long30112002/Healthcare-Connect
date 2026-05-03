import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const usePaymentWebSocket = (appointmentId: string, onPaymentSuccess: () => void) => {
    const clientRef = useRef<Client | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const hasNotifiedRef = useRef(false);  // 👈 Thêm ref để tránh gọi nhiều lần

    useEffect(() => {
        if (!appointmentId) return;

        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            debug: (str) => console.log('WebSocket:', str),
            reconnectDelay: 5000,
            onConnect: () => {
                // console.log('WebSocket connected');
                client.subscribe(`/topic/payment/${appointmentId}`, (message) => {
                    const data = JSON.parse(message.body);
                    console.log('📨 Payment notification:', data);

                    if ((data.status === 'PAID' || data.status === 'SUCCESS') && !hasNotifiedRef.current) {
                        hasNotifiedRef.current = true;  // 👈 Chỉ gọi 1 lần
                        setIsProcessing(true);
                        setTimeout(() => {
                            onPaymentSuccess();
                        }, 500);
                    }
                });
            },
            onDisconnect: () => {
                console.log('WebSocket disconnected');
            },
            onStompError: (frame) => {
                console.error('STOMP error:', frame);
            }
        });

        client.activate();
        clientRef.current = client;

        return () => {
            if (clientRef.current?.active) {
                clientRef.current.deactivate();
            }
            hasNotifiedRef.current = false;
        };
    }, [appointmentId, onPaymentSuccess]);

    return { isProcessing };
};

export default usePaymentWebSocket;