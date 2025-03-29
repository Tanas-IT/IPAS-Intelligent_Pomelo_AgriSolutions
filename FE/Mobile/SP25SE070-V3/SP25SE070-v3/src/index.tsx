import 'react-native-gesture-handler';
import AppNavigation from "@/navigation/AppNavigation";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React, { useCallback } from "react";
import * as SplashScreen from "expo-splash-screen";
import { NativeBaseProvider, theme } from "native-base";
import Toast from "react-native-toast-message";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";
import { PaperProvider } from "react-native-paper";

export default function MainApp() {
  const [isAppReady, setIsAppReady] = React.useState(false);

  const [fontsLoaded, fontError] = useFonts({
    "Balsamiq-Sans": require("../assets/fonts/BalsamiqSans-Regular.ttf"),
  });

  //   useEffect(() => {
  //     if (fontsLoaded) {
  //       SplashScreen.hideAsync();
  //     }
  //   }, [fontsLoaded]);

  //   if (!fontsLoaded) {
  //     return <View><Text>Loading Fonts...</Text></View>;
  //   }

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      setIsAppReady(true);
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView
      style={{
        flex: 1,
      }}
      onLayout={() => {
        setTimeout(() => {
          onLayoutRootView();
        }, 1000);
      }}
    >
      <NativeBaseProvider theme={theme}>
        <PaperProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            {isAppReady && <AppNavigation />}
            <Toast />
          </NavigationContainer>
        </PaperProvider>
      </NativeBaseProvider>
    </GestureHandlerRootView>
  );
}
