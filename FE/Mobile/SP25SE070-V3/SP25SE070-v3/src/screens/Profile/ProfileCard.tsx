// import React, { useEffect, useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity } from 'react-native';
// import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
// import Toast from 'react-native-toast-message';
// import dayjs from 'dayjs';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { MaterialIcons } from '@expo/vector-icons';

// import styles from './styles';
// import { GetUser2 } from '@/types/user';
// import { formatDate, getUserId } from '@/utils';
// import ActionButton from './ActionButton';
// import { GENDER_OPTIONS } from '@/constants';
// import { userService } from '@/services';
// import { useAuthStore } from '@/store';
// import { Loading, TextCustom } from '@/components';

// interface ProfileCardProps {
//   isEditing: boolean;
//   setIsEditing: (value: boolean) => void;
// }

// const ProfileCard: React.FC<ProfileCardProps> = ({ isEditing, setIsEditing }) => {
//   const [userData, setUserData] = useState<GetUser2 | null>(null);
//   const [formValues, setFormValues] = useState<any>({});
//   const [isChanged, setIsChanged] = useState(false);
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const scale = useSharedValue(1);
//   const {userId} = useAuthStore();

//   const animatedStyle = useAnimatedStyle(() => ({
//     transform: [{ scale: scale.value }],
//   }));

//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const res = await userService.getUser(Number(userId));
//         console.log("====================1111111111", res);
        
//         if (res.statusCode === 200 && res.data) {
//           setUserData(res.data);
//           setFormValues({
//             ...res.data,
//             dob: res.data.dob ? dayjs(res.data.dob) : null,
//           });
//         }
//       } catch (error) {
//         Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to fetch user data' });
//       }
//     };
//     fetchUser();
//   }, []);

//   const handleValuesChange = (field: string, value: any) => {
//     setFormValues((prev: any) => ({ ...prev, [field]: value }));
//     setIsChanged(true);
//     scale.value = withSpring(1.05, {}, () => (scale.value = withSpring(1)));
//   };

//   const handleDateChange = (event: any, selectedDate?: Date) => {
//     setShowDatePicker(false);
//     if (selectedDate) {
//       handleValuesChange('dob', selectedDate);
//     }
//   };

//   const handleUpdate = async () => {
//     // try {
//     //   const payload = {
//     //     ...formValues,
//     //     userId: userData?.userId,
//     //     dob: formValues.dob ? formatDateReq(formValues.dob) : undefined,
//     //   };
//     //   const res = await userService.updateUser(payload);
//     //   if (res.statusCode === 200 && res.data) {
//     //     setUserData(res.data);
//     //     setIsChanged(false);
//     //     setIsEditing(false);
//     //     useUserStore.getState().setUserInfo(res.data.fullName, res.data.avatarURL || '');
//     //     Toast.show({ type: 'success', text1: 'Success', text2: res.message });
//     //   } else {
//     //     Toast.show({ type: 'error', text1: 'Error', text2: res.message });
//     //   }
//     // } catch (error) {
//     //   Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to update profile' });
//     // }
//   };

//   const handleReset = () => {
//     if (!userData) return;
//     setFormValues({
//       ...userData,
//       dob: userData.dob ? dayjs(userData.dob) : null,
//     });
//     setIsChanged(false);
//     setIsEditing(false);
//   };

//   if (!userData) {
//     return <Loading/>;
//   }

//   return (
//     <Animated.View style={[styles.card, animatedStyle]}>
//       <TextCustom style={styles.cardTitle}>Profile Information</TextCustom>

//       {isEditing ? (
//         <>
//           <View style={styles.formField}>
//             <TextCustom style={styles.label}>Full Name</TextCustom>
//             <TextInput
//               style={styles.input}
//               value={formValues.fullName}
//               onChangeText={(value) => handleValuesChange('fullName', value)}
//             />
//           </View>
//           <View style={styles.formField}>
//             <TextCustom style={styles.label}>Email</TextCustom>
//             <TextInput
//               style={[styles.input, styles.inputDisabled]}
//               value={formValues.email}
//               editable={false}
//             />
//           </View>
//           <View style={styles.formField}>
//             <TextCustom style={styles.label}>Phone Number</TextCustom>
//             <TextInput
//               style={styles.input}
//               value={formValues.phoneNumber}
//               onChangeText={(value) => handleValuesChange('phoneNumber', value)}
//             />
//           </View>
//           <View style={styles.formField}>
//             <TextCustom style={styles.label}>Date of Birth</TextCustom>
//             <TouchableOpacity
//               style={styles.input}
//               onPress={() => setShowDatePicker(true)}
//             >
//               <TextCustom style={styles.dateText}>
//                 {formValues.dob
//                   ? formValues.dob.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
//                   : 'Select Date'}
//               </TextCustom>
//               <MaterialIcons name="calendar-today" size={20} color="#6B48FF" />
//             </TouchableOpacity>
//             {showDatePicker && (
//               <DateTimePicker
//                 value={formValues.dob || new Date()}
//                 mode="date"
//                 display="default"
//                 onChange={handleDateChange}
//               />
//             )}
//           </View>
//           <View style={styles.formField}>
//             <TextCustom style={styles.label}>Gender</TextCustom>
//             <View style={styles.radioGroup}>
//               {GENDER_OPTIONS.map((option) => (
//                 <TouchableOpacity
//                   key={option.value}
//                   style={[
//                     styles.radioOption,
//                     formValues.gender === option.value && styles.radioOptionSelected,
//                   ]}
//                   onPress={() => handleValuesChange('gender', option.value)}
//                 >
//                   <TextCustom style={styles.radioText}>{option.label}</TextCustom>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           </View>
//           <View style={styles.formField}>
//             <TextCustom style={styles.label}>Account Created On</TextCustom>
//             <TextInput
//               style={[styles.input, styles.inputDisabled]}
//               value={formatDate(userData.createDate)}
//               editable={false}
//             />
//           </View>
//           <View style={styles.actionButtons}>
//             <ActionButton title="Cancel" onPress={handleReset} disabled={!isChanged} />
//             <ActionButton
//               title="Save"
//               onPress={handleUpdate}
//               disabled={!isChanged}
//               gradient
//             />
//           </View>
//         </>
//       ) : (
//         <>
//           <View style={styles.infoRow}>
//             <TextCustom style={styles.infoLabel}>Full Name:</TextCustom>
//             <TextCustom style={styles.infoValue}>{userData.fullName}</TextCustom>
//           </View>
//           <View style={styles.infoRow}>
//             <TextCustom style={styles.infoLabel}>Email:</TextCustom>
//             <TextCustom style={styles.infoValue}>{userData.email}</TextCustom>
//           </View>
//           <View style={styles.infoRow}>
//             <TextCustom style={styles.infoLabel}>Phone Number:</TextCustom>
//             <TextCustom style={styles.infoValue}>{userData.phoneNumber}</TextCustom>
//           </View>
//           <View style={styles.infoRow}>
//             <TextCustom style={styles.infoLabel}>Date of Birth:</TextCustom>
//             <TextCustom style={styles.infoValue}>{formatDate(userData.dob)}</TextCustom>
//           </View>
//           <View style={styles.infoRow}>
//             <TextCustom style={styles.infoLabel}>Gender:</TextCustom>
//             <TextCustom style={styles.infoValue}>{userData.gender}</TextCustom>
//           </View>
//           <View style={styles.infoRow}>
//             <TextCustom style={styles.infoLabel}>Account Created:</TextCustom>
//             <TextCustom style={styles.infoValue}>{formatDate(userData.createDate)}</TextCustom>
//           </View>
//         </>
//       )}
//     </Animated.View>
//   );
// };

// export default ProfileCard;
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import dayjs from 'dayjs';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';

import styles from './styles';
import { GetUser2, UserRequest } from '@/types/user';
import { formatDate, formatDateReq } from '@/utils';
import ActionButton from './ActionButton';
import { GENDER_OPTIONS } from '@/constants';
import { userService } from '@/services';
import { useAuthStore } from '@/store';
import { Loading, TextCustom } from '@/components';
import { LoginResponse } from '@/payloads';

interface ProfileCardProps {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ isEditing, setIsEditing }) => {
  const [userData, setUserData] = useState<GetUser2 | null>(null);
  const [formValues, setFormValues] = useState<any>({});
  const [isChanged, setIsChanged] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const scale = useSharedValue(1);
  const { userId, roleId, accessToken, refreshToken, setAuth } = useAuthStore();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await userService.getUser(Number(userId));
        console.log('Fetch user response:', res);

        if (res.statusCode === 200 && res.data) {
          setUserData(res.data);
          setFormValues({
            ...res.data,
            dob: res.data.dob ? dayjs(res.data.dob) : null,
          });
        }
      } catch (error) {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to fetch user data' });
      }
    };
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const handleValuesChange = (field: string, value: any) => {
    setFormValues((prev: any) => ({ ...prev, [field]: value }));
    setIsChanged(true);
    scale.value = withSpring(1.05, {}, () => (scale.value = withSpring(1)));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleValuesChange('dob', selectedDate);
    }
  };

  const handleUpdate = async () => {
    try {
      const payload: UserRequest = {
        userId: userData?.userId,
        fullName: formValues.fullName,
        email: formValues.email,
        phoneNumber: formValues.phoneNumber,
        dob: formatDateReq(formValues.dob || '') || "",
        gender: formValues.gender,
        roleName: userData?.roleName || 'User',
      };
      const res = await userService.updateUser(payload);
      if (res.statusCode === 200 && res.data) {
        setUserData(res.data);
        setIsChanged(false);
        setIsEditing(false);

        // Ánh xạ GetUser2 sang LoginResponse
        const loginResponse: LoginResponse = {
          authenModel: {
            accessToken: accessToken || '',
            refreshToken: refreshToken || '',
          },
          fullname: res.data.fullName,
          avatar: res.data.avatarURL || '',
        };

        // Cập nhật auth store
        setAuth(loginResponse, String(userId), roleId || '');
        Toast.show({ type: 'success', text1: 'Success', text2: res.message });
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: res.message });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to update profile' });
    }
  };

  const handleReset = () => {
    if (!userData) return;
    setFormValues({
      ...userData,
      dob: userData.dob ? dayjs(userData.dob) : null,
    });
    setIsChanged(false);
    setIsEditing(false);
  };

  if (!userData) {
    return <Loading />;
  }

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <TextCustom style={styles.cardTitle}>Profile Information</TextCustom>

      {isEditing ? (
        <>
          <View style={styles.formField}>
            <TextCustom style={styles.label}>Full Name</TextCustom>
            <TextInput
              style={styles.input}
              value={formValues.fullName}
              onChangeText={(value) => handleValuesChange('fullName', value)}
            />
          </View>
          <View style={styles.formField}>
            <TextCustom style={styles.label}>Email</TextCustom>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={formValues.email}
              editable={false}
            />
          </View>
          <View style={styles.formField}>
            <TextCustom style={styles.label}>Phone Number</TextCustom>
            <TextInput
              style={styles.input}
              value={formValues.phoneNumber}
              onChangeText={(value) => handleValuesChange('phoneNumber', value)}
            />
          </View>
          <View style={styles.formField}>
            <TextCustom style={styles.label}>Date of Birth</TextCustom>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDatePicker(true)}
            >
              <TextCustom style={styles.dateText}>
                {formValues.dob
                  ? formValues.dob.toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })
                  : 'Select Date'}
              </TextCustom>
              <MaterialIcons name="calendar-today" size={20} color="#6B48FF" />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={formValues.dob || new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
          </View>
          <View style={styles.formField}>
            <TextCustom style={styles.label}>Gender</TextCustom>
            <View style={styles.radioGroup}>
              {GENDER_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.radioOption,
                    formValues.gender === option.value && styles.radioOptionSelected,
                  ]}
                  onPress={() => handleValuesChange('gender', option.value)}
                >
                  <TextCustom style={styles.radioText}>{option.label}</TextCustom>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.formField}>
            <TextCustom style={styles.label}>Account Created On</TextCustom>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={formatDate(userData.createDate)}
              editable={false}
            />
          </View>
          <View style={styles.actionButtons}>
            <ActionButton title="Cancel" onPress={handleReset} disabled={!isChanged} />
            <ActionButton
              title="Save"
              onPress={handleUpdate}
              disabled={!isChanged}
              gradient
            />
          </View>
        </>
      ) : (
        <>
          <View style={styles.infoRow}>
            <TextCustom style={styles.infoLabel}>Full Name:</TextCustom>
            <TextCustom style={styles.infoValue}>{userData.fullName}</TextCustom>
          </View>
          <View style={styles.infoRow}>
            <TextCustom style={styles.infoLabel}>Email:</TextCustom>
            <TextCustom style={styles.infoValue}>{userData.email}</TextCustom>
          </View>
          <View style={styles.infoRow}>
            <TextCustom style={styles.infoLabel}>Phone Number:</TextCustom>
            <TextCustom style={styles.infoValue}>{userData.phoneNumber}</TextCustom>
          </View>
          <View style={styles.infoRow}>
            <TextCustom style={styles.infoLabel}>Date of Birth:</TextCustom>
            <TextCustom style={styles.infoValue}>{formatDate(userData.dob)}</TextCustom>
          </View>
          <View style={styles.infoRow}>
            <TextCustom style={styles.infoLabel}>Gender:</TextCustom>
            <TextCustom style={styles.infoValue}>{userData.gender}</TextCustom>
          </View>
          <View style={styles.infoRow}>
            <TextCustom style={styles.infoLabel}>Account Created:</TextCustom>
            <TextCustom style={styles.infoValue}>{formatDate(userData.createDate)}</TextCustom>
          </View>
        </>
      )}
    </Animated.View>
  );
};

export default ProfileCard;