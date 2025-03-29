import { NavigatorScreenParams } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

interface RootStackParamList {
  Login: undefined;
  Main?: NavigatorScreenParams<MainTabParamList>;
  Scan: undefined;
  ChatAI: undefined;
  PestDetection: undefined;
}

interface MainTabParamList {
  Home: undefined;
  Worklog: undefined;
  Scan: undefined;
  ChatAI: undefined;
  PestDetection: undefined;
}

interface DrawerParamList {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  FarmPicker: undefined;
}

type AuthNavigationProp = StackNavigationProp<RootStackParamList>;
declare type AuthNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;
type MainDrawerNavigationProp = DrawerNavigationProp<DrawerParamList>;