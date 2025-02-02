import { LOCAL_STORAGE_KEYS } from "@/constants";
import { useState } from "react";

const useLocalStorage = () => {
  const getAuthData = () => {
    // Lấy dữ liệu từ localStorage, trả về đối tượng
    const authData = {
      accessToken: localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN),
      refreshToken: localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN),
      fullName: localStorage.getItem(LOCAL_STORAGE_KEYS.FULL_NAME),
      avatar: localStorage.getItem(LOCAL_STORAGE_KEYS.AVATAR),
    };
    return authData;
  };

  const saveAuthData = (data: {
    accessToken: string;
    refreshToken: string;
    fullName: string;
    avatar: string;
  }) => {
    // Lưu vào localStorage
    localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
    localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
    localStorage.setItem(LOCAL_STORAGE_KEYS.FULL_NAME, data.fullName);
    localStorage.setItem(LOCAL_STORAGE_KEYS.AVATAR, data.avatar);
  };

  const clearAuthData = () => {
    // Xóa dữ liệu khỏi localStorage
    localStorage.clear();
  };

  return {
    getAuthData,
    saveAuthData,
    clearAuthData,
  };
};

export default useLocalStorage;
