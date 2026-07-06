import { useState, useEffect } from 'react';

const WebSocketStatus = ({ currentUser }) => {
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [lastMessage, setLastMessage] = useState('None');
  const [isVisible, setIsVisible] = useState(true);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    // Listen for WebSocket status updates
    const handleStorageChange = (e) => {
      if (e.key === 'wsStatus') {
        setConnectionStatus(e.newValue || 'Disconnected');
      }
      if (e.key === 'wsLastMessage') {
        setLastMessage(e.newValue || 'None');
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Check initial status
    setConnectionStatus(localStorage.getItem('wsStatus') || 'Disconnected');
    setLastMessage(localStorage.getItem('wsLastMessage') || 'None');

    // Auto-hide after 10 seconds if connected
    const timer = setTimeout(() => {
      if (connectionStatus === 'Connected') {
        setIsVisible(false);
      }
    }, 10000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearTimeout(timer);
    };
  }, [connectionStatus]);

  const checkUserAuthorities = async () => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://tpms.8bit.co.in/api';
      const response = await fetch(`${apiBaseUrl}/auth/debug/authorities`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('🔍 User authorities:', result);
        setDebugInfo(`Auth: ${result.authorities || 'None'}`);
      } else {
        console.error('❌ Failed to check authorities:', response.status);
        setDebugInfo(`Auth check failed: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Authority check error:', error);
      setDebugInfo(`Auth error: ${error.message}`);
    }
  };

  const testWebSocketLogout = async () => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://tpms.8bit.co.in/api';
      const response = await fetch(`${apiBaseUrl}/auth/test-websocket/${currentUser.username}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.text();
        console.log('🧪 WebSocket test sent:', result);
        setDebugInfo(`Test sent: ${result}`);
      } else {
        console.error('❌ WebSocket test failed:', response.status);
        setDebugInfo(`Test failed: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ WebSocket test error:', error);
      setDebugInfo(`Test error: ${error.message}`);
    }
  };

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development' || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-slate-800 text-white p-3 rounded-lg shadow-lg text-xs max-w-xs border border-slate-600">
      <div className="flex items-center justify-between mb-2">
        <div className="font-bold">WebSocket Status</div>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-slate-400 hover:text-white text-sm"
        >
          ✕
        </button>
      </div>
      <div className="space-y-1">
        <div>User: {currentUser?.username || 'None'}</div>
        <div className="flex items-center gap-2">
          Status: 
          <span className={`inline-block w-2 h-2 rounded-full ${
            connectionStatus === 'Connected' ? 'bg-green-500' : 
            connectionStatus === 'Connecting' ? 'bg-yellow-500' : 'bg-red-500'
          }`}></span>
          <span className={`text-xs ${
            connectionStatus === 'Connected' ? 'text-green-400' : 
            connectionStatus === 'Connecting' ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {connectionStatus}
          </span>
        </div>
       
      </div>
     
    </div>
  );
};

export default WebSocketStatus;