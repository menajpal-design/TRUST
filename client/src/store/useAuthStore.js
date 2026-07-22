import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  activeOrganization: null,
  organizations: [],
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: ({ user, activeOrganization, organizations, accessToken }) => set({
    user,
    activeOrganization,
    organizations,
    accessToken,
    isAuthenticated: true,
    isLoading: false
  }),

  setAccessToken: (accessToken) => set({ accessToken }),

  setActiveOrganization: (activeOrganization) => set({ activeOrganization }),

  logout: () => set({
    user: null,
    activeOrganization: null,
    organizations: [],
    accessToken: null,
    isAuthenticated: false,
    isLoading: false
  }),

  setLoading: (isLoading) => set({ isLoading })
}));

export default useAuthStore;
