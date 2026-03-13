import React, { useState, useEffect } from 'react';

const WebSocketStatus = ({ currentUser }) => {
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [lastMessage, setLastMessage] = useState('None');
  const [isVisible, setIsVisible] = useState(true);

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
        {lastMessage !== 'None' && (
          <div className="text-yellow-300">Last: {lastMessage}</div>
        )}
      </div>
    </div>
  );
};

export default WebSocketStatus;