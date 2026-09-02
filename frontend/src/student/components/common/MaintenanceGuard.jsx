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
        const res = await axios.get('http://localhost:5000/api/settings/public');
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
