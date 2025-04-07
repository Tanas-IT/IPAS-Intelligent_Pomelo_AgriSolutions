import { create } from "zustand";
import { persist, StateStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@/constants";
import { LoginResponse, TokenInFarm } from "@/payloads";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  roleId: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  farmName: string | null;
  farmLogo: string | null;
  setAuth: (data: LoginResponse, userId: string, roleId: string) => void; // Updated definition here
  updateRoleInFarm: (data: TokenInFarm, userId: string, roleId: string) => void;
  updateRoleOutFarm: (
    data: LoginResponse,
    userId: string,
    roleId: string
  ) => void;
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
      userId: null,
      roleId: null,
      fullName: null,
      avatarUrl: null,
      farmName: null,
      farmLogo: null,
      setAuth: (data, userId, roleId) =>
        set({
          accessToken: data.authenModel.accessToken,
          refreshToken: data.authenModel.refreshToken,
          userId: userId,
          roleId: roleId,
          fullName: data.fullname,
          avatarUrl: data.avatar,
        }),
      updateRoleInFarm: (data, userId, roleId) =>
        set({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          userId: userId,
          roleId: roleId,
          farmName: data.farmName,
          farmLogo: data.farmLogo,
        }),
      updateRoleOutFarm: (data, userId, roleId) =>
        set({
          accessToken: data.authenModel.accessToken,
          refreshToken: data.authenModel.refreshToken,
          userId: userId,
          roleId: roleId,
          farmName: null,
          farmLogo: null,
        }),
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          userId: null,
          roleId: null,
          fullName: null,
          avatarUrl: null,
          farmName: null,
          farmLogo: null,
        }),
    }),
    {
      name: "auth",
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
    AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, state.accessToken);
    AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, state.refreshToken || "");
  } else {
    AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  }
});
