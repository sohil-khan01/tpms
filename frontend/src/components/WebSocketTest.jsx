import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WebSocketTest = ({ currentUser }) => {
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [messages, setMessages] = useState([]);
  const stompClientRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!currentUser?.username) {
      console.log('WebSocketTest - No current user, skipping connection');
      return;
    }

    const connectWebSocket = () => {
      try {
        console.log('🧪 WebSocketTest - Connecting for user:', currentUser.username);
        setConnectionStatus('Connecting...');
        
        const client = new Client({
          webSocketFactory: () => {
            return new SockJS('http://localhost:8080/ws-logout');
          },
          connectHeaders: {},
          debug: function (str) {
            console.log('🧪 WebSocketTest STOMP Debug:', str);
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
        });

        stompClientRef.current = client;

        client.onConnect = function () {
          console.log('🧪 WebSocketTest - Connected successfully');
          setConnectionStatus('Connected');
          
          // Subscribe to user-specific logout topic
          const userSubscription = client.subscribe(
            `/user/${currentUser.username}/topic/logout`, 
            (message) => {
              console.log('🧪 WebSocketTest - Received user-specific message:', message.body);
              setMessages(prev => [...prev, {
                timestamp: new Date().toLocaleTimeString(),
                message: `User-specific: ${message.body}`,
                type: 'received'
              }]);
            }
          );

          // Subscribe to general topic as backup
          const generalSubscription = client.subscribe(
            `/topic/logout/${currentUser.username}`, 
            (message) => {
              console.log('🧪 WebSocketTest - Received general message:', message.body);
              setMessages(prev => [...prev, {
                timestamp: new Date().toLocaleTimeString(),
                message: `General: ${message.body}`,
                type: 'received'
              }]);
            }
          );

          console.log('🧪 WebSocketTest - Subscribed to both topics for:', currentUser.username);
        };

        client.onStompError = function (frame) {
          console.error('🧪 WebSocketTest - STOMP Error:', frame);
          setConnectionStatus('Error');
        };

        client.onWebSocketError = function (error) {
          console.error('🧪 WebSocketTest - WebSocket Error:', error);
          setConnectionStatus('Error');
        };

        client.onWebSocketClose = function (event) {
          console.log('🧪 WebSocketTest - Connection closed:', event);
          setConnectionStatus('Disconnected');
        };

        client.activate();

      } catch (error) {
        console.error('🧪 WebSocketTest - Setup error:', error);
        setConnectionStatus('Setup Error');
      }
    };

    connectWebSocket();

    return () => {
      if (stompClientRef.current) {
        try {
          stompClientRef.current.deactivate();
          console.log('🧪 WebSocketTest - Disconnected');
        } catch (error) {
          console.error('🧪 WebSocketTest - Disconnect error:', error);
        }
      }
    };
  }, [currentUser?.username]);

  const sendTestMessage = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/auth/test-websocket/${currentUser.username}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.text();
        console.log('🧪 Test message sent:', result);
        setMessages(prev => [...prev, {
          timestamp: new Date().toLocaleTimeString(),
          message: 'Test message sent to server',
          type: 'sent'
        }]);
      } else {
        console.error('🧪 Failed to send test message:', response.status);
      }
    } catch (error) {
      console.error('🧪 Test message error:', error);
    }
  };

  const sendForceLogout = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/auth/deactivate/${currentUser.username}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        console.log('🧪 Force logout sent');
        setMessages(prev => [...prev, {
          timestamp: new Date().toLocaleTimeString(),
          message: 'Force logout sent to server',
          type: 'sent'
        }]);
      } else {
        console.error('🧪 Failed to send force logout:', response.status);
      }
    } catch (error) {
      console.error('🧪 Force logout error:', error);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development' || !isVisible) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 bg-slate-800 text-white p-4 rounded-lg shadow-lg text-xs max-w-md border border-slate-600 z-50">
      <div className="flex items-center justify-between mb-3">
        <div className="font-bold text-sm">WebSocket Test Panel</div>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-slate-400 hover:text-white text-sm"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 mb-3">
        <div>User: {currentUser?.username || 'None'}</div>
        <div className="flex items-center gap-2">
          Status: 
          <span className={`inline-block w-2 h-2 rounded-full ${
            connectionStatus === 'Connected' ? 'bg-green-500' : 
            connectionStatus === 'Connecting...' ? 'bg-yellow-500' : 'bg-red-500'
          }`}></span>
          <span className={`text-xs ${
            connectionStatus === 'Connected' ? 'text-green-400' : 
            connectionStatus === 'Connecting...' ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {connectionStatus}
          </span>
        </div>
      </div>

      <div className="space-y-1 mb-3">
        <button 
          onClick={sendTestMessage}
          className="w-full px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
          disabled={connectionStatus !== 'Connected'}
        >
          Send Test Message
        </button>
        <button 
          onClick={sendForceLogout}
          className="w-full px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
          disabled={connectionStatus !== 'Connected'}
        >
          Test Force Logout
        </button>
        <button 
          onClick={clearMessages}
          className="w-full px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded"
        >
          Clear Messages
        </button>
      </div>

      {messages.length > 0 && (
        <div className="border-t border-slate-600 pt-2">
          <div className="text-xs font-semibold mb-1">Messages:</div>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {messages.slice(-5).map((msg, index) => (
              <div key={index} className={`text-xs p-1 rounded ${
                msg.type === 'sent' ? 'bg-blue-900' : 'bg-green-900'
              }`}>
                <div className="text-slate-300">{msg.timestamp}</div>
                <div>{msg.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WebSocketTest;