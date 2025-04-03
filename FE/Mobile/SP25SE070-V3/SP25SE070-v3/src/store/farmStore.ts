import { create } from 'zustand';
import { persist, StateStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FarmState {
  farmName: string;
  farmLogo: string;
  farmExpiredDate: string;
  isFarmExpired: boolean;
  setFarmInfo: (name: string, logo: string, expiredDate?: string) => void;
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

export const useFarmStore = create<FarmState>()(
  persist(
    (set) => ({
      farmName: '',
      farmLogo: '',
      farmExpiredDate: '',
      isFarmExpired: false,
      setFarmInfo: (name: string, logo: string, expiredDate = '') => {
        const isExpired = expiredDate ? new Date(expiredDate) < new Date() : false;
        set({ farmName: name, farmLogo: logo });
      },
    }),
    {
      name: 'farm',
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