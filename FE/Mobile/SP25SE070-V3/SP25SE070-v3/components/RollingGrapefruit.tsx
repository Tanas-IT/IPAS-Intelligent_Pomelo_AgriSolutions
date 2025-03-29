import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import Svg, { Circle, Path } from 'react-native-svg';

// Lấy kích thước màn hình
const { width } = Dimensions.get('window');

export default function RollingGrapefruit() {
  return (
    <View style={styles.container}>
      <MotiView
        from={{ translateX: -100, rotate: '0deg' }}
        animate={{ translateX: width + 100, rotate: '360deg' }}
        transition={{
          type: 'timing',
          duration: 3000,
          repeat: Infinity,
        }}
      >
        <Svg width={60} height={60} viewBox="0 0 60 60">
          {/* Vòng tròn chính của quả bưởi */}
          <Circle cx="30" cy="30" r="28" fill="#FFA500" stroke="#FF4500" strokeWidth={3} />

          {/* Các múi bưởi */}
          <Path
            d="M30 30 L30 2 A28 28 0 0 1 50 10 Z"
            fill="#FFD700"
            stroke="#FF8C00"
            strokeWidth={2}
          />
          <Path
            d="M30 30 L50 10 A28 28 0 0 1 58 30 Z"
            fill="#FFD700"
            stroke="#FF8C00"
            strokeWidth={2}
          />
          <Path
            d="M30 30 L58 30 A28 28 0 0 1 50 50 Z"
            fill="#FFD700"
            stroke="#FF8C00"
            strokeWidth={2}
          />
          <Path
            d="M30 30 L50 50 A28 28 0 0 1 30 58 Z"
            fill="#FFD700"
            stroke="#FF8C00"
            strokeWidth={2}
          />
          <Path
            d="M30 30 L30 58 A28 28 0 0 1 10 50 Z"
            fill="#FFD700"
            stroke="#FF8C00"
            strokeWidth={2}
          />
          <Path
            d="M30 30 L10 50 A28 28 0 0 1 2 30 Z"
            fill="#FFD700"
            stroke="#FF8C00"
            strokeWidth={2}
          />
          <Path
            d="M30 30 L2 30 A28 28 0 0 1 10 10 Z"
            fill="#FFD700"
            stroke="#FF8C00"
            strokeWidth={2}
          />
          <Path
            d="M30 30 L10 10 A28 28 0 0 1 30 2 Z"
            fill="#FFD700"
            stroke="#FF8C00"
            strokeWidth={2}
          />
        </Svg>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    height: 60,
  },
});
