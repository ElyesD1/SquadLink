import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_URL } from './constants';

const SOCKET_URL = API_URL;

interface PartyUpdate {
  partyId: string;
  event: 'party_created' | 'party_updated' | 'party_deleted' | 'member_joined' | 'member_left' | 'join_request';
  data?: any;
}

interface Notification {
  type: 'party_join_request' | 'join_request' | 'request_accepted' | 'request_rejected' | 'kicked' | 'member_left';
  message: string;
  title?: string;
  data?: any;
}

export function usePartySocket(userEmail?: string) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!userEmail) return;

    // Connect to party namespace with email for authentication
    const socket = io(`${SOCKET_URL}/party`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      auth: {
        email: userEmail
      }
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to party socket');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from party socket');
      setIsConnected(false);
    });

    socket.on('notification', (notification: Notification) => {
      console.log('Received notification:', notification);
      
      // Check if this notification already exists (to avoid duplicates)
      setNotifications(prev => {
        const isDuplicate = prev.some(notif => 
          notif.type === notification.type &&
          (notif as any).data?.partyId === (notification as any).data?.partyId &&
          (notif as any).data?.requesterId === (notification as any).data?.requesterId
        );
        
        if (isDuplicate) {
          return prev; // Don't add duplicate
        }
        
        return [...prev, notification];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [userEmail]);

  const joinPartyRoom = (partyId: string) => {
    socketRef.current?.emit('party:join-room', { partyId });
  };

  const leavePartyRoom = (partyId: string) => {
    socketRef.current?.emit('party:leave-room', { partyId });
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const removeNotification = (index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  const onPartyUpdate = (callback: (update: PartyUpdate) => void) => {
    socketRef.current?.on('party:update', callback);
    return () => {
      socketRef.current?.off('party:update', callback);
    };
  };

  const onPartiesUpdate = (callback: (data: any) => void) => {
    socketRef.current?.on('parties:update', callback);
    return () => {
      socketRef.current?.off('parties:update', callback);
    };
  };

  return {
    socket: socketRef.current,
    isConnected,
    notifications,
    setNotifications,
    joinPartyRoom,
    leavePartyRoom,
    clearNotifications,
    removeNotification,
    onPartyUpdate,
    onPartiesUpdate
  };
}
