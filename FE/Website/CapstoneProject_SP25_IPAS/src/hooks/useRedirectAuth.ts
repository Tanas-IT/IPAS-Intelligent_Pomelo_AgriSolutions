import { LOCAL_STORAGE_KEYS, UserRole } from "@/constants";
import { PATHS } from "@/routes";
import { getRoleId } from "@/utils";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const useRedirectAuth = (): boolean => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);

    if (accessToken && refreshToken) {
      const roleId = getRoleId();
      if (roleId === UserRole.User.toString()) navigate(PATHS.FARM_PICKER);
      if (roleId === UserRole.Admin.toString()) navigate(PATHS.ADMIN.USER_LIST);
      if (roleId === UserRole.Owner.toString()) navigate(PATHS.DASHBOARD);
      //   if (roleId === UserRole.Employee.toString()) navigate(PATHS.);
      setIsAuthenticated(true);
    }
  }, [navigate]);
  return isAuthenticated;
};

export default useRedirectAuth;
