import React from 'react';
import { createDrawerNavigator, DrawerContentComponentProps } from '@react-navigation/drawer';
import { DrawerParamList, RootStackNavigationProp } from './Types';
import MainTabs from './MainTabs';
import FarmPickerScreen from '@/screens/FarmPicker/FarmPickerScreen';
import { CustomDrawerContent } from './CustomDrawerContent';
import ProfileScreen from '@/screens/ProfileScreen';
import { Notification } from './components/Notification';
import { ROUTE_NAMES } from './RouteNames';
import { useNavigation } from '@react-navigation/native';

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
        headerRight: () => (
          <Notification 
            unreadCount={5} // Số lượng thông báo chưa đọc
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