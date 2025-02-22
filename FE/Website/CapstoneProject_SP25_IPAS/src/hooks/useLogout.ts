import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useLocalStorage from "./useLocalStorage";
import { PATHS } from "@/routes";
import { authService } from "@/services";

const useLogout = () => {
  const navigate = useNavigate();
  const { getAuthData, clearAuthData } = useLocalStorage();

  const handleLogout = async () => {
    const authData = getAuthData();
    if (authData.refreshToken && authData.accessToken) {
      var result = await authService.logout(authData.refreshToken);
      // if (result.statusCode === 200) {
        clearAuthData();
        navigate(PATHS.AUTH.LOGIN);
      // }
    }
  };

  return handleLogout;
};

export default useLogout;
