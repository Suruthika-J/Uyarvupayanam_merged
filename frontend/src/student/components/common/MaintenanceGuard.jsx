import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MaintenancePage from '../../pages/public/MaintenancePage';

export default function MaintenanceGuard({ children }) {
  const [maintenance, setMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        // Use direct axios for public check to avoid interceptors potentially blocking
        const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
        const res = await axios.get(`${API_BASE}/settings/public`);
        if (res.data && res.data.maintenanceMode) {
          setMaintenance(true);
        }
      } catch (e) {
        console.error('Maintenance check failed', e);
      } finally {
        setLoading(false);
      }
    };
    checkMaintenance();
  }, []);

  if (loading) return null; // Or a small loader
  if (maintenance) return <MaintenancePage />;
  
  return children;
}
