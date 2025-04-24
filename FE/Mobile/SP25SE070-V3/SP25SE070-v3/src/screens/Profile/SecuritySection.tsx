import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import styles from './styles';
import { TextCustom } from '@/components';

const SecuritySection: React.FC = () => {
  return (
    <View style={styles.card}>
      <TextCustom style={styles.cardTitle}>Security Settings</TextCustom>
      <TouchableOpacity style={styles.securityItem}>
        <Feather name="lock" size={20} color="#6B48FF" />
        <TextCustom style={styles.securityText}>Change Password</TextCustom>
      </TouchableOpacity>
      <TouchableOpacity style={styles.securityItem}>
        <Feather name="shield" size={20} color="#6B48FF" />
        <TextCustom style={styles.securityText}>Two-Factor Authentication</TextCustom>
      </TouchableOpacity>
    </View>
  );
};

export default SecuritySection;