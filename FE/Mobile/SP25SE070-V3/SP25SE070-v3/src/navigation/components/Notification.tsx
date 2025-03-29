import React from 'react';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomIcon from 'components/CustomIcon';

interface NotificationIconProps {
  unreadCount?: number;
  iconSize?: number;
  badgeColor?: string;
  iconColor?: string;
  onPress?: () => void;
}

export const Notification: React.FC<NotificationIconProps> = ({
  unreadCount = 0,
  iconSize = 24,
  badgeColor = '#FF6B6B',
  iconColor = '#064944',
  onPress,
}) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      console.log("không được");
    }
  };

  return (
    <TouchableOpacity 
      onPress={handlePress}
      style={styles.container}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <CustomIcon name='bell-ring' color={iconColor} type='MaterialCommunityIcons' />
      
      {unreadCount > 0 && (
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          {unreadCount <= 9 ? (
            <Text style={styles.badgeText}>{unreadCount}</Text>
          ) : (
            <Text style={styles.badgeText}>9+</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginRight: 16,
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});