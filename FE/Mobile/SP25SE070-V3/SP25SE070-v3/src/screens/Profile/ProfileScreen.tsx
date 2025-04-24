import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import ProfileCard from './ProfileCard';
import AvatarUploader from './AvatarUploader';
import SecuritySection from './SecuritySection';
import styles from './styles';
import { useAuthStore } from '@/store';
import { TextCustom } from '@/components';
import theme from '@/theme';

const ProfileScreen: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { fullName, avatarUrl } = useAuthStore();

  return (
    <LinearGradient colors={['#fffcee', '#fffcee']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <AvatarUploader />
          <TextCustom style={styles.fullName}>{fullName || 'User Name'}</TextCustom>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Feather name={isEditing ? 'x' : 'edit-2'} size={20} color="#FFFFFF" />
            <TextCustom style={styles.editButtonText}>{isEditing ? 'Cancel' : 'Edit Profile'}</TextCustom>
          </TouchableOpacity>
        </Animated.View>

        {/* Profile Information */}
        <Animated.View entering={FadeInDown.duration(700)} style={styles.cardContainer}>
          <ProfileCard isEditing={isEditing} setIsEditing={setIsEditing} />
        </Animated.View>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <View style={styles.dividerContent}>
            <Feather name="lock" size={20} color={theme.colors.primary} />
            <TextCustom style={styles.dividerText}>Security Settings</TextCustom>
          </View>
          <View style={styles.dividerLine} />
        </View>

        {/* Security Settings */}
        <Animated.View entering={FadeInDown.duration(900)} style={styles.cardContainer}>
          <SecuritySection />
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
};

export default ProfileScreen;