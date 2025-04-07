import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomIcon from './CustomIcon';
import { RootStackNavigationProp, RootStackParamList } from '@/constants/Types';
import { ROUTE_NAMES } from '@/constants/RouteNames';

type BackButtonProps = {
  targetScreen?: keyof RootStackParamList;
  targetParams?: any;
  iconColor?: string;
};

const BackButton: React.FC<BackButtonProps> = ({ 
  targetScreen = ROUTE_NAMES.MAIN.MAIN_TABS, 
  targetParams,
  iconColor = 'white' 
}) => {
  const navigation = useNavigation<RootStackNavigationProp>();

  const handlePress = () => {
    if (targetScreen === ROUTE_NAMES.MAIN.MAIN_TABS) {
      // Xử lý cho Main screen
      navigation.navigate(ROUTE_NAMES.MAIN.DRAWER, { 
        screen: ROUTE_NAMES.MAIN.MAIN_TABS,
        ...(targetParams || {})
      });
    } else {
      // Xử lý cho các screen khác
      navigation.navigate(targetScreen, targetParams);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, { position: 'absolute', top: 30, left: 10, zIndex: 100 }]}
      onPress={handlePress}
    >
      <CustomIcon
        name="arrow-left"
        size={24}
        color={iconColor}
        type="MaterialCommunityIcons"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
});

export default BackButton;