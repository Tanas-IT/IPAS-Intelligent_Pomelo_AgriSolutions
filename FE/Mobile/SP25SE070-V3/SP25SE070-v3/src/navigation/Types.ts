import { NoteFormData } from '@/types/plant';
import { NavigatorScreenParams, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { ROUTE_NAMES } from './RouteNames';
import { WorklogNoteFormData } from '@/types/worklog';

export type RootStackParamList = {
  [ROUTE_NAMES.AUTH.LOGIN]: undefined;
  [ROUTE_NAMES.MAIN.DRAWER]: { 
    screen?: keyof DrawerParamList;
    params?: NavigatorScreenParams<MainTabParamList>;
  };
  [ROUTE_NAMES.PLANT.PLANT_DETAIL]: { plantId: string };
  [ROUTE_NAMES.NOTIFICATION]: undefined;
  [ROUTE_NAMES.PLANT.ADD_NOTE]: {
    plantId: number;
    historyId?: number;
    initialData?: NoteFormData;
  };
  [ROUTE_NAMES.WORKLOG.WORKLOG_DETAIL]: { worklogId: string };
  [ROUTE_NAMES.WORKLOG.ADD_NOTE_WORKLOG]: { 
    worklogId: string;
    historyId?: string;
    initialData?: WorklogNoteFormData;
  };
};

export type MainTabParamList = {
  Home: undefined;
  Worklog: undefined;
  Scan: undefined;
  ChatAI: undefined;
  PestDetection: undefined;
};

export type DrawerParamList = {
  [ROUTE_NAMES.MAIN.MAIN_TABS]: NavigatorScreenParams<MainTabParamList> | undefined;
  [ROUTE_NAMES.FARM.FARM_PICKER]: undefined;
  [ROUTE_NAMES.MAIN.PROFILE]: undefined;
};

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export type MainTabNavigationProp = {
  navigate: (screen: keyof MainTabParamList) => void;
};

export type AuthNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type PlantDetailRouteProp = RouteProp<RootStackParamList, typeof ROUTE_NAMES.PLANT.PLANT_DETAIL>;
export type WorklogDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'WorklogDetail'>;