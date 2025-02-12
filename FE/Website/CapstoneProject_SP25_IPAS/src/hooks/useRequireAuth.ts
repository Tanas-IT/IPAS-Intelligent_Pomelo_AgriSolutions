import { LOCAL_STORAGE_KEYS, MESSAGES } from "@/constants";
import { PATHS } from "@/routes";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const useRequireAuth = (): boolean => {
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);

    if (!accessToken && !refreshToken) {
      toast.error(MESSAGES.LOGIN_REQUIRED);
      navigate(PATHS.AUTH.LOGIN);
    } else {
      setIsAuthChecked(true);
    }
  }, [navigate]);

  return isAuthChecked;
};

export default useRequireAuth;
