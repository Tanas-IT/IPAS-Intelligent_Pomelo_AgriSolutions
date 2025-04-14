// import messaging from '@react-native-firebase/messaging';
// import * as Notifications from 'expo-notifications';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import Toast from 'react-native-toast-message';
// import { Platform } from 'react-native';

// export class PushNotificationService {
//   // Kiểm tra và yêu cầu quyền thông báo
//   static async requestPermission() {
//     if (Platform.OS === 'ios') {
//       const { status } = await Notifications.requestPermissionsAsync();
//       if (status !== 'granted') {
//         console.log('Notification permission denied on iOS.');
//         return false;
//       }
//     }

//     const authStatus = await messaging().requestPermission();
//     const enabled =
//       authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
//       authStatus === messaging.AuthorizationStatus.PROVISIONAL;

//     if (enabled) {
//       console.log('Notification permission granted.');
//       await this.getFcmToken();
//       return true;
//     } else {
//       console.log('Notification permission denied.');
//       return false;
//     }
//   }

//   // Lấy FCM token
//   static async getFcmToken() {
//     try {
//       if (Platform.OS === 'ios') {
//         await messaging().registerDeviceForRemoteMessages();
//       }
//       const fcmToken = await messaging().getToken();
//       if (fcmToken) {
//         console.log('FCM Token:', fcmToken);
//         await AsyncStorage.setItem('fcmToken', fcmToken);
//       }
//     } catch (error) {
//       console.error('Error getting FCM token:', error);
//     }
//   }

//   // Xử lý thông báo khi app ở foreground
//   static setupForegroundHandler() {
//     Notifications.setNotificationHandler({
//       handleNotification: async () => ({
//         shouldShowAlert: true,
//         shouldPlaySound: true,
//         shouldSetBadge: true,
//       }),
//     });

//     messaging().onMessage(async (remoteMessage) => {
//       console.log('Foreground notification:', remoteMessage);
//       await Notifications.scheduleNotificationAsync({
//         content: {
//           title: remoteMessage.notification?.title || 'New Notification',
//           body: remoteMessage.notification?.body || 'You have a new message',
//         },
//         trigger: null,
//       });

//       Toast.show({
//         type: 'info',
//         text1: remoteMessage.notification?.title || 'New Notification',
//         text2: remoteMessage.notification?.body || 'You have a new message',
//       });
//     });
//   }

//   // Xử lý thông báo khi app ở background hoặc killed
//   static setupBackgroundHandler() {
//     messaging().setBackgroundMessageHandler(async (remoteMessage) => {
//       console.log('Background notification:', remoteMessage);
//       await Notifications.scheduleNotificationAsync({
//         content: {
//           title: remoteMessage.notification?.title || 'New Notification',
//           body: remoteMessage.notification?.body || 'You have a new message',
//         },
//         trigger: null,
//       });
//     });
//   }

//   // Xử lý khi người dùng nhấn vào thông báo
//   static setupNotificationOpenedHandler(navigation: any) {
//     messaging().onNotificationOpenedApp((remoteMessage) => {
//       console.log('Notification opened:', remoteMessage);
//       navigation.navigate('Notifications');
//     });

//     messaging()
//       .getInitialNotification()
//       .then((remoteMessage) => {
//         if (remoteMessage) {
//           console.log('App opened from killed state:', remoteMessage);
//           navigation.navigate('Notifications');
//         }
//       });

//     Notifications.addNotificationResponseReceivedListener((response) => {
//       console.log('Notification response:', response);
//       navigation.navigate('Notifications');
//     });
//   }

//   // Khởi tạo push notification service
//   static async initialize(navigation?: any) {
//     await this.requestPermission();
//     this.setupForegroundHandler();
//     this.setupBackgroundHandler();
//     if (navigation) {
//       this.setupNotificationOpenedHandler(navigation);
//     }
//   }

//   // Gửi thông báo thủ công (dùng với WebSocket)
//   static async displayNotification(title: string, body: string) {
//     await Notifications.scheduleNotificationAsync({
//       content: {
//         title,
//         body,
//       },
//       trigger: null,
//     });
//   }
// }