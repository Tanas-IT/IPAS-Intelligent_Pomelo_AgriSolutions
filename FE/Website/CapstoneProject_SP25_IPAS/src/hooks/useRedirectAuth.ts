import { LOCAL_STORAGE_KEYS, UserRolesStr } from "@/constants";
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
      if (roleId === UserRolesStr.User) navigate(PATHS.FARM_PICKER);
      if (roleId === UserRolesStr.Admin) navigate(PATHS.ADMIN.DASHBOARD);
      if (roleId === UserRolesStr.Owner) navigate(PATHS.DASHBOARD);
      if (roleId === UserRolesStr.Manager) navigate(PATHS.DASHBOARD);
      if (roleId === UserRolesStr.Employee) navigate(PATHS.EMPLOYEE.DASHBOARD);
      if (roleId === UserRolesStr.Expert) navigate(PATHS.EXPERT.REPORT_LIST);
      setIsAuthenticated(true);
    }
  }, [navigate]);
  return isAuthenticated;
};

export default useRedirectAuth;
