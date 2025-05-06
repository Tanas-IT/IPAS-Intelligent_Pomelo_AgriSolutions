import "react-native-gesture-handler";
import AppNavigation from "@/navigation/AppNavigation";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { GluestackUIProvider } from "@gluestack-ui/themed";
// import config from "./gluestack-ui.config";
import { config } from '@gluestack-ui/config';
// import { extendTheme, NativeBaseProvider, theme } from "native-base";
import Toast from "react-native-toast-message";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";
import { DefaultTheme, PaperProvider } from "react-native-paper";
import { Keyboard } from "react-native";
import { navigationRef } from "./services/NavigationService";
// import { PushNotificationService } from "./services/pushNotificationService";

const themeCustome = {
  ...DefaultTheme,
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: "BalsamiqSans-Regular",
      fontWeight: "normal",
    },
    medium: {
      fontFamily: "BalsamiqSans-Regular",
      fontWeight: "normal",
    },
  },
};

const customConfig = {
  ...config,
  tokens: {
    ...config.tokens,
    fonts: {
      balsamiqSans: {
        regular: 'BalsamiqSans-Regular',
        bold: 'BalsamiqSans-Bold',
        italic: 'BalsamiqSans-Italic',
      },
    },
    space: {
      ...config.tokens.space,
      8: 8,
    },
  },
  aliases: {
    fontFamily: {
      body: 'balsamiqSans',
    },
  },
};

export default function MainApp() {
  const [isAppReady, setIsAppReady] = React.useState(false);

  // useEffect(() => {
  //   PushNotificationService.initialize();
  // }, []);

  const [fontsLoaded, fontError] = useFonts({
    "BalsamiqSans-Regular": require("@/assets/fonts/BalsamiqSans-Regular.ttf"),
    "BalsamiqSans-Bold": require("@/assets/fonts/BalsamiqSans-Bold.ttf"),
    "BalsamiqSans-Italic": require("@/assets/fonts/BalsamiqSans-Italic.ttf"),
  });

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
      <GluestackUIProvider config={customConfig}>
        <PaperProvider theme={themeCustome}>
          <NavigationContainer ref={navigationRef}>
            <StatusBar style="auto" />
            {isAppReady && <AppNavigation />}
            <Toast />
          </NavigationContainer>
        </PaperProvider>
        </GluestackUIProvider>
    </GestureHandlerRootView>
  );
}
