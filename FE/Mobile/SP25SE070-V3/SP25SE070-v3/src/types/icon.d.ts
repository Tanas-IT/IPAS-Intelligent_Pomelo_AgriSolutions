import { MaterialCommunityIcons } from '@expo/vector-icons';

export type IconType = 
  | 'MaterialCommunityIcons'
  | 'MaterialIcons'
  | 'Ionicons';

export type MaterialIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export type DrawerIconProps = {
  color: string;
  size: number;
  focused?: boolean;
};