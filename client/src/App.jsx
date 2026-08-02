import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { SocketProvider } from './context/SocketContext';
import useAuthStore from './store/useAuthStore';
import { fetchCurrentUser } from './services/auth.service';

export default function App() {
  const { setAuth, setLoading, accessToken } = useAuthStore();

  useEffect(() => {
    const token = accessToken || localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }

    fetchCurrentUser()
      .then((res) => {
        if (res && res.data) {
          setAuth({
            user: res.data.user,
            activeOrganization: res.data.activeOrganization,
            organizations: res.data.organizations,
            accessToken: token
          });
        }
      })
      .catch((err) => {
        console.warn('Session sync notice:', err?.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);


  return (
    <BrowserRouter>
      <SocketProvider>
        <AppRoutes />
      </SocketProvider>
    </BrowserRouter>
  );
}
