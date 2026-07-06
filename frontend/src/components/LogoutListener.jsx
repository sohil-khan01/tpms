import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useNavigate } from 'react-router-dom';

const LogoutListener = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();
  const stompClientRef = useRef(null);
  const isConnectedRef = useRef(false);
  const hasLoggedOutRef = useRef(false);
  const reconnectTimerRef = useRef(null);

  useEffect(() => {
    if (!currentUser?.username) return;

    const username = currentUser.username;

    const performLogout = () => {
      // Prevent double logout
      if (hasLoggedOutRef.current) return;
      hasLoggedOutRef.current = true;

      console.log('🚪 Force logout for:', username);

      // Show notification overlay
      showNotification();

      // Clear auth data immediately
      localStorage.removeItem('authToken');
      localStorage.removeItem('adminUser');
      localStorage.removeItem('isAuthenticated');

      // Notify App component
      if (onLogout) onLogout();

      // Navigate to login after short delay (let notification show)
      setTimeout(() => {
        removeNotification();
        navigate('/', { replace: true });
      }, 2000);
    };

    const showNotification = () => {
      removeNotification(); // remove any existing
      const el = document.createElement('div');
      el.id = 'force-logout-overlay';
      el.innerHTML = `
        <div style="
          position:fixed;top:0;left:0;right:0;bottom:0;
          background:rgba(0,0,0,0.85);z-index:99999;
          display:flex;align-items:center;justify-content:center;
          font-family:system-ui,sans-serif;
        ">
          <div style="
            background:linear-gradient(135deg,#1e293b,#334155);
            color:white;padding:40px;border-radius:16px;
            text-align:center;max-width:380px;width:90%;
            border:1px solid #475569;box-shadow:0 25px 50px rgba(0,0,0,0.4);
          ">
            <div style="font-size:52px;margin-bottom:16px;">⚠️</div>
            <div style="font-size:22px;font-weight:700;margin-bottom:12px;">Account Deactivated</div>
            <div style="font-size:15px;color:#cbd5e1;line-height:1.6;">
              Your account has been deactivated by an administrator.<br/>
              Redirecting to login...
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(el);
    };

    const removeNotification = () => {
      const el = document.getElementById('force-logout-overlay');
      if (el) el.remove();
    };

    const connect = () => {
      // Don't reconnect if already logged out
      if (hasLoggedOutRef.current) return;

      console.log('🔌 WebSocket connecting for:', username);

      // Get backend URL dynamically from current hostname
      const getBackendUrl = () => {
        // If explicitly set in env, use it
        if (import.meta.env.VITE_BACKEND_BASE_URL) {
          return import.meta.env.VITE_BACKEND_BASE_URL;
        }
        
        // Otherwise, construct from current window location
        const protocol = window.location.protocol; // http: or https:
        const hostname = window.location.hostname; // actual IP or localhost
        const backendPort = 2000; // Backend port
        
        return `${protocol}//${hostname}:${backendPort}`;
      };

      const backendUrl = getBackendUrl();

      const client = new Client({
        webSocketFactory: () => new SockJS(`${backendUrl}/ws-logout`),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        debug: () => {}, // silence debug logs
      });

      stompClientRef.current = client;

      client.onConnect = () => {
        isConnectedRef.current = true;
        console.log('✅ WebSocket connected for:', username);

        // Subscribe to user-specific topic
        // convertAndSendToUser sends to /user/{username}/topic/logout
        client.subscribe(`/user/${username}/topic/logout`, (msg) => {
          console.log('📨 WebSocket message received:', msg.body);
          if (msg.body === 'FORCE_LOGOUT') {
            performLogout();
          }
        });
      };

      client.onStompError = (frame) => {
        console.error('❌ STOMP error:', frame.headers['message']);
        isConnectedRef.current = false;
        
        // If it's a security error, show helpful message
      //   if (frame.headers['message']?.includes('SecurityError') || 
      //       frame.headers['message']?.includes('insecure')) {
      //     console.error('🔒 WebSocket security error - likely HTTPS/HTTP protocol mismatch');
      //   }
      // };

      // client.onWebSocketError = (error) => {
      //   console.error('❌ WebSocket error:', error);
      //   isConnectedRef.current = false;
        
      //   // Handle security errors specifically
      //   if (error.message?.includes('SecurityError')) {
      //     console.error('🔒 Security error: Cannot connect to insecure WebSocket from secure page');
      //     console.log('💡 Solution: Ensure both frontend and backend use the same protocol (HTTP or HTTPS)');
      //   }
      };

      client.onWebSocketClose = () => {
        isConnectedRef.current = false;
        console.log('🔌 WebSocket closed for:', username);
      };

      client.activate();
    };

    connect();

    // Fallback: poll localStorage every 1s in case WebSocket misses the message
    const pollInterval = setInterval(() => {
      if (hasLoggedOutRef.current) {
        clearInterval(pollInterval);
        return;
      }
      const flag = localStorage.getItem(`forceLogout_${username}`);
      if (flag) {
        localStorage.removeItem(`forceLogout_${username}`);
        performLogout();
      }
    }, 1000);

    return () => {
      clearInterval(pollInterval);
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (stompClientRef.current) {
        try { stompClientRef.current.deactivate(); } catch (_) {}
      }
      removeNotification();
      isConnectedRef.current = false;
    };
  }, [currentUser?.username]); // eslint-disable-line

  return null;
};

export default LogoutListener;
