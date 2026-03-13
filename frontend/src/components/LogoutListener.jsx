import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useNavigate } from 'react-router-dom';

const LogoutListener = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();
  const stompClientRef = useRef(null);
  const isConnectedRef = useRef(false);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    if (!currentUser?.username) {
      console.log('No current user, skipping WebSocket connection');
      return;
    }

    const connectWebSocket = () => {
      try {
        console.log('🔌 Connecting to WebSocket for user:', currentUser.username);
        localStorage.setItem('wsStatus', 'Connecting...');
        
        // Create STOMP client with SockJS
        const client = new Client({
          webSocketFactory: () => {
            console.log('🏭 Creating SockJS connection to: http://localhost:8080/ws-logout');
            return new SockJS('http://localhost:8080/ws-logout');
          },
          connectHeaders: {},
          debug: function (str) {
            if (process.env.NODE_ENV === 'development') {
              console.log('📡 STOMP Debug:', str);
            }
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          // Add connection timeout
          connectionTimeout: 15000,
          // Disable automatic reconnection to handle it manually
          reconnectDelay: 0,
        });

        stompClientRef.current = client;

        // Connection success handler
        client.onConnect = function () {
          console.log('✅ WebSocket Connected for user:', currentUser.username);
          isConnectedRef.current = true;
          localStorage.setItem('wsStatus', 'Connected');
          
          // Clear any pending reconnect
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
          }
          
          // Subscribe to user-specific logout topic
          client.subscribe(
            `/user/${currentUser.username}/topic/logout`, 
            (message) => {
              console.log('📨 Received logout message:', message.body);
              localStorage.setItem('wsLastMessage', message.body);
              handleLogoutMessage(message.body);
            }
          );

          console.log('🎯 Subscribed to logout topic:', `/user/${currentUser.username}/topic/logout`);
        };

        // Error handlers
        client.onStompError = function (frame) {
          console.error('❌ STOMP Error:', frame.headers['message']);
          console.error('Error details:', frame.body);
          localStorage.setItem('wsStatus', 'STOMP Error');
          isConnectedRef.current = false;
          scheduleReconnect();
        };

        client.onWebSocketError = function (error) {
          console.error('❌ WebSocket Error:', error);
          localStorage.setItem('wsStatus', 'Connection Error');
          isConnectedRef.current = false;
          scheduleReconnect();
        };

        client.onWebSocketClose = function (event) {
          console.log('🔌 WebSocket connection closed:', event.code, event.reason);
          localStorage.setItem('wsStatus', 'Disconnected');
          isConnectedRef.current = false;
          
          // Only reconnect if it wasn't a clean close and user is still authenticated
          if (event.code !== 1000 && localStorage.getItem('isAuthenticated') === 'true') {
            scheduleReconnect();
          }
        };

        client.onDisconnect = function () {
          console.log('🔌 STOMP Disconnected');
          localStorage.setItem('wsStatus', 'Disconnected');
          isConnectedRef.current = false;
        };

        // Activate the client
        client.activate();

      } catch (error) {
        console.error('❌ Error setting up WebSocket:', error);
        localStorage.setItem('wsStatus', 'Setup Error');
        scheduleReconnect();
      }
    };

    const scheduleReconnect = () => {
      if (reconnectTimeoutRef.current) return; // Already scheduled
      
      console.log('⏰ Scheduling WebSocket reconnect in 5 seconds...');
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectTimeoutRef.current = null;
        
        // Check if user is still authenticated before reconnecting
        const isAuth = localStorage.getItem('isAuthenticated');
        if (isAuth === 'true') {
          connectWebSocket();
        }
      }, 5000);
    };

    const handleLogoutMessage = (message) => {
      if (message === "FORCE_LOGOUT") {
        console.log('🚪 Force logout triggered for user:', currentUser.username);
        
        // Create and show beautiful notification
        showLogoutNotification();
        
        // Perform logout after notification
        setTimeout(() => {
          performSmoothLogout();
        }, 3000);
      } else if (message === "TEST_MESSAGE") {
        console.log('🧪 Test message received for user:', currentUser.username);
        // Don't trigger logout for test messages
      } else {
        console.log('📨 Unknown message received:', message);
      }
    };

    const showLogoutNotification = () => {
      // Remove any existing notification
      const existingNotification = document.getElementById('logout-notification');
      if (existingNotification) {
        existingNotification.remove();
      }

      // Create notification element
      const notification = document.createElement('div');
      notification.id = 'logout-notification';
      notification.innerHTML = `
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: system-ui, -apple-system, sans-serif;
        ">
          <div style="
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            color: white;
            padding: 30px 40px;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 400px;
            border: 1px solid #475569;
          ">
            <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 15px; color: #f1f5f9;">
              Account Deactivated
            </div>
            <div style="font-size: 16px; line-height: 1.5; margin-bottom: 20px; color: #cbd5e1;">
              Your account has been deactivated by an administrator.<br>
              You will be logged out automatically.
            </div>
            <div style="
              background: #dc2626;
              color: white;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 14px;
              display: inline-block;
            ">
              Logging out in 3 seconds...
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(notification);
    };

    const performSmoothLogout = () => {
      console.log('🔄 Performing smooth logout...');
      
      // Remove notification
      const notification = document.getElementById('logout-notification');
      if (notification) {
        notification.remove();
      }
      
      // Clear authentication data
      localStorage.removeItem('authToken');
      localStorage.removeItem('adminUser');
      localStorage.removeItem('isAuthenticated');
      
      // Call parent logout handler if available
      if (onLogout) {
        onLogout();
      }
      
      // Use window.location.replace for smooth navigation without refresh
      window.location.replace('/');
    };

    // Initialize connection
    connectWebSocket();

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up WebSocket for user:', currentUser.username);
      
      // Clear reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      // Disconnect WebSocket
      if (stompClientRef.current && isConnectedRef.current) {
        try {
          stompClientRef.current.deactivate();
          console.log('✅ WebSocket disconnected successfully');
        } catch (error) {
          console.error('❌ Error disconnecting WebSocket:', error);
        }
      }
      
      // Remove any notification
      const notification = document.getElementById('logout-notification');
      if (notification) {
        notification.remove();
      }
      
      isConnectedRef.current = false;
      localStorage.setItem('wsStatus', 'Disconnected');
    };

  }, [currentUser?.username, navigate, onLogout]);

  return null;
};

export default LogoutListener;