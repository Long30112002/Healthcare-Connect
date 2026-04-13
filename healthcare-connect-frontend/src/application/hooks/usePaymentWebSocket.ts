import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';


const usePaymentWebSocket = (appointmentId: string, onPaymentSuccess: () => void) => {
    const clientRef = useRef<Client | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    setTimeout(() => {
        window.dispatchEvent(new Event('appointmentUpdated'));
        onPaymentSuccess();
    }, 500);

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
                    // console.log('📨 Payment notification:', data);

                    if (data.status === 'PAID' || data.status === 'SUCCESS') {
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
        };
    }, [appointmentId, onPaymentSuccess]);

    return { isProcessing };
};

export default usePaymentWebSocket;