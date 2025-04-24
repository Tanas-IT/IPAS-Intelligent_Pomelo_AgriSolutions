import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import styles from './styles';
import { TextCustom } from '@/components';

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  gradient?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ title, onPress, disabled, gradient }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => (scale.value = withSpring(0.95))}
      onPressOut={() => (scale.value = withSpring(1))}
    >
      <Animated.View style={animatedStyle}>
        {gradient ? (
          <LinearGradient
            colors={disabled ? ['#CCCCCC', '#CCCCCC'] : ['#6B48FF', '#00DDEB']}
            style={styles.actionButton}
          >
            <TextCustom style={styles.actionButtonText}>{title}</TextCustom>
          </LinearGradient>
        ) : (
          <View style={[styles.actionButton, disabled && styles.actionButtonDisabled]}>
            <TextCustom style={styles.actionButtonText}>{title}</TextCustom>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default ActionButton;