import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [socket, setSocket] = useState(null);

    /*
     * socket-lifecycle-manager
     * Establishes a persistent full-duplex connection to the backend.
     * - Initialization: Connects to the API server origin.
     * - Teardown: Ensures clean disconnection when the component unmounts to prevent memory leaks.
     */
    useEffect(() => {
        // Connect to the backend socket server
        const newSocket = io(window.location.origin.replace('3000', '5000'), {
            transports: ['websocket'],
            upgrade: false
        });

        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    /*
     * channel-subscription-handler
     * Joins user-specific private rooms once authentication is confirmed.
     * Enables targeted delivery of notifications (e.g., "Your article was approved").
     */
    useEffect(() => {
        if (socket && isAuthenticated && user) {
            // Join a private room for user-specific notifications
            socket.emit('join', user.id);
        }
    }, [socket, isAuthenticated, user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
