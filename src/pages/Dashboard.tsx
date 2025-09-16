import React, { useEffect, useState } from 'react';
import App from '../App';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';

// Wrap existing App (which manages local tasks UI) with server sync
const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [isServerReachable, setIsServerReachable] = useState(true);

  useEffect(() => {
    const ping = async () => {
      try { await api.get('/health'); setIsServerReachable(true); } catch { setIsServerReachable(false); }
    };
    ping();
  }, []);

  return (
    <div className="min-h-screen">
      {!isServerReachable && (
        <div className="bg-yellow-50 text-yellow-800 text-sm px-4 py-2 text-center">Backend not reachable. Working locally only.</div>
      )}
      <App />
    </div>
  );
};

export default Dashboard;



