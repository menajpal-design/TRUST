import { create } from 'zustand';

const initialToken = localStorage.getItem('accessToken') || null;

export const useAuthStore = create((set) => ({
  user: null,
  activeOrganization: null,
  organizations: [],
  accessToken: initialToken,
  isAuthenticated: Boolean(initialToken),
  isLoading: true,

  setAuth: ({ user, activeOrganization, organizations, accessToken }) => {
    const tokenToSave = accessToken || localStorage.getItem('accessToken');
    if (tokenToSave) {
      localStorage.setItem('accessToken', tokenToSave);
    }
    set({
      user,
      activeOrganization,
      organizations,
      accessToken: tokenToSave,
      isAuthenticated: true,
      isLoading: false
    });
  },

  setAccessToken: (accessToken) => {
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
    } else {
      localStorage.removeItem('accessToken');
    }
    set({ accessToken, isAuthenticated: Boolean(accessToken) });
  },

  setActiveOrganization: (activeOrganization) => set({ activeOrganization }),

  logout: () => {
    localStorage.removeItem('accessToken');
    set({
      user: null,
      activeOrganization: null,
      organizations: [],
      accessToken: null,
      isAuthenticated: false,
      isLoading: false
    });
  },

  setLoading: (isLoading) => set({ isLoading })
}));


export default useAuthStore;
