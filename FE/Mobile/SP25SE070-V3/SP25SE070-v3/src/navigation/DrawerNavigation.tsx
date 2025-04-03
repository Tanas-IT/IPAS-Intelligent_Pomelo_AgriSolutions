import React from 'react';
import { createDrawerNavigator, DrawerContentComponentProps } from '@react-navigation/drawer';
import { DrawerParamList, RootStackNavigationProp } from './Types';
import MainTabs from './MainTabs';
import FarmPickerScreen from '@/screens/FarmPicker/FarmPickerScreen';
import { CustomDrawerContent } from './CustomDrawerContent';
import ProfileScreen from '@/screens/Profile/ProfileScreen';
import { Notification } from './components/Notification';
import { ROUTE_NAMES } from './RouteNames';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import CustomIcon from 'components/CustomIcon';
import theme from '@/theme';

const Drawer = createDrawerNavigator<DrawerParamList>();

export default function DrawerNavigation() {
  const navigation = useNavigation<RootStackNavigationProp>();
  return (
    <Drawer.Navigator
      drawerContent={(props: DrawerContentComponentProps) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerType: 'slide',
        headerTitle: "",
        drawerStyle: {
          width: '80%',
          backgroundColor: '#f5f5f5',
        },
        swipeEnabled: true,
        headerTintColor: theme.colors.primary,
        headerRight: () => (
          <Notification 
            unreadCount={5}
            onPress={() => navigation.navigate(ROUTE_NAMES.NOTIFICATION)}
          />
        ),
        headerRightContainerStyle: {
          paddingRight: 16,
        },
        headerLeftContainerStyle: {
          paddingLeft: 16,
        },
      }}
    >
      <Drawer.Screen name={ROUTE_NAMES.MAIN.MAIN_TABS} component={MainTabs} />
      <Drawer.Screen name={ROUTE_NAMES.FARM.FARM_PICKER} component={FarmPickerScreen} />
      <Drawer.Screen name={ROUTE_NAMES.MAIN.PROFILE} component={ProfileScreen} />
    </Drawer.Navigator>
  );
}