import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { SocketProvider } from './context/SocketContext';
import useAuthStore from './store/useAuthStore';
import { fetchCurrentUser } from './services/auth.service';

export default function App() {
  const { setAuth, logout, setLoading } = useAuthStore();

  useEffect(() => {
    fetchCurrentUser()
      .then((res) => {
        setAuth({
          user: res.data.user,
          activeOrganization: res.data.activeOrganization,
          organizations: res.data.organizations,
          accessToken: null
        });
      })
      .catch(() => {
        logout();
      })
      .finally(() => {
        setLoading(false);
      });
  }, [setAuth, logout, setLoading]);

  return (
    <BrowserRouter>
      <SocketProvider>
        <AppRoutes />
      </SocketProvider>
    </BrowserRouter>
  );
}
