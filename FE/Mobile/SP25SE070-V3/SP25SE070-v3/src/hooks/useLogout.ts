import { AuthNavigationProp, ROUTE_NAMES } from "@/constants";
import { AuthService } from "@/services";
import { useAuthStore } from "@/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const useLogout = () => {
  const navigation = useNavigation<AuthNavigationProp>();

  const handleLogout = async () => {
    const { accessToken, refreshToken } = useAuthStore.getState();

    if (accessToken && refreshToken) {
      await AuthService.logout(refreshToken);
    }
    await AsyncStorage.clear();
    navigation.reset({
      index: 0,
      routes: [{ name: ROUTE_NAMES.AUTH.LOGIN }],
    });
  };

  return handleLogout;
};

export default useLogout;
