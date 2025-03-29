import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar, Platform } from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { useTheme } from 'native-base';
import CustomIcon from 'components/CustomIcon';
import { avt } from 'assets/images';
import { LinearGradient } from 'expo-linear-gradient';
import { ROUTE_NAMES } from './RouteNames';

export function CustomDrawerContent(props: DrawerContentComponentProps) {
  const theme = useTheme();
  const { colors } = theme;
  const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

  const handleLogout = () => {
    props.navigation.navigate(ROUTE_NAMES.AUTH.LOGIN);
  };

  const menuItems = [
    { label: 'Farm Picker', icon: 'barn', screen: 'FarmPicker' },
    { label: 'Scan QR Code', icon: 'qrcode-scan', screen: 'Scan' },
    { label: 'Notifications', icon: 'bell', screen: 'Notifications' },
    { label: 'Profile', icon: 'account', screen: 'Profile' },
    { label: 'Settings', icon: 'cog', screen: 'Settings' }
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#BCD379', '#064944']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, { paddingTop: STATUS_BAR_HEIGHT }]}
      >
        <View style={styles.userContainer}>
          <View style={styles.avatarContainer}>
            <Image source={avt} style={styles.avatar} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Jenna Madelyyyvvv</Text>
            <View style={styles.userRole}>
              <CustomIcon name="user" type="FontAwesome" size={16} color="white" />
              <Text style={styles.roleText}>Employee</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.proBadge}>
        <Text style={styles.proText}>Farm: ABCDEFU</Text>
      </View>

      {/* Menu items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => props.navigation.navigate(item.screen)}
          >
            <View style={styles.iconContainer}>
              <CustomIcon 
                name={item.icon} 
                type="MaterialCommunityIcons" 
                size={22} 
                color='#064944'
              />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerTitle}>Intelligent Pomelo AgriSolutions</Text>
        <Text style={styles.versionText}>Version 1.0.1</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <CustomIcon name="logout" type="MaterialCommunityIcons" size={20} color='red' />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  gradient: {
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 50
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  userRole: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleText: {
    fontSize: 14,
    color: 'white',
    marginLeft: 6,
  },
  proBadge: {
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: -10,
    marginBottom: 20,
    zIndex: 1,
    backgroundColor: '#FEE69C'
  },
  proText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#064944',
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#ECF2DA'
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#064944',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginBottom: 30
  },
  footerTitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  versionText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
    color: 'red'
  },
});