import { create } from 'zustand';
import { persist, StateStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginResponse, TokenInFarm } from '@/types/auth';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  role: 'User' | 'Admin' | null;
  fullName: string | null;
  avatar: string | null;
  setAuth: (data: LoginResponse) => void;
  updateRoleInFarm: (data: TokenInFarm) => void;
  logout: () => void;
}

const asyncStorageAdapter: StateStorage = {
  getItem: async (key: string): Promise<string | null> => {
    return await AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    await AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    await AsyncStorage.removeItem(key);
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      role: null,
      fullName: null,
      avatar: null,
      setAuth: (data) =>
        set({
          accessToken: data.authenModel.accessToken,
          refreshToken: data.authenModel.refreshToken,
          role: 'User',
          fullName: data.fullname,
          avatar: data.avatar,
        }),
      updateRoleInFarm: (data) =>
        set({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          role: data.role,
        }),
      logout: () => set({ accessToken: null, refreshToken: null, role: null, fullName: null, avatar: null }),
    }),
    {
      name: 'auth',
      storage: {
        getItem: async (name) => {
          const value = await asyncStorageAdapter.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await asyncStorageAdapter.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await asyncStorageAdapter.removeItem(name);
        },
      },
    }
  )
);

useAuthStore.subscribe((state) => {
  if (state.accessToken) {
    AsyncStorage.setItem('accessToken', state.accessToken);
    AsyncStorage.setItem('refreshToken', state.refreshToken || '');
  } else {
    AsyncStorage.removeItem('accessToken');
    AsyncStorage.removeItem('refreshToken');
  }
});