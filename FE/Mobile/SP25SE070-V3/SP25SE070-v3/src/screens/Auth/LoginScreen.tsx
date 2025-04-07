import React, { useState } from "react";
import { View, Pressable, SafeAreaView } from "react-native";
import { TextInput, ActivityIndicator } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "@/validations/authSchemas";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { KeyboardAvoidingView, VStack } from "native-base";
import { AuthNavigationProp, ROUTE_NAMES } from "@/constants";
import { AuthService } from "@/services";
import theme from "@/theme";
import { styles } from "./LoginScreen.styles";
import { CustomTextInput, TextCustom } from "@/components";
import { useAuthStore } from "@/store";
import { getRoleId, getUserId } from "@/utils";
import { UserRole } from "@/constants";

type FormData = {
  email: string;
  password: string;
};

export const LoginScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation<AuthNavigationProp>();
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const res = await AuthService.login(data);
      if (res.statusCode === 200) {
        const roleId = getRoleId(res.data.authenModel.accessToken);
        const userId = getUserId(res.data.authenModel.accessToken);
        useAuthStore.getState().setAuth(res.data, userId, roleId);
        Toast.show({
          type: "success",
          text1: res.message,
        });
        if (roleId === UserRole.User.toString())
          navigation.navigate(ROUTE_NAMES.MAIN.DRAWER, {
            screen: ROUTE_NAMES.FARM.FARM_PICKER,
          });
        if (roleId === UserRole.Admin.toString())
          navigation.navigate(ROUTE_NAMES.MAIN.DRAWER, {
            screen: ROUTE_NAMES.MAIN.MAIN_TABS,
          });
        reset({
          email: "",
          password: "",
        });
      } else {
        Toast.show({
          type: "error",
          text1: res.message,
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Login failed",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <LinearGradient
        colors={[theme.colors.secondary, theme.colors.primary]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <SafeAreaView style={styles.hello}>
          <TextCustom style={styles.header}>Hello</TextCustom>
          <TextCustom style={styles.subHeader}>Sign in!</TextCustom>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.formContainer}>
        <View style={styles.formContent}>
          {/* Email Input */}
          <VStack w="100%" space={8}>
            <Controller
              control={control}
              name="email"
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error, isDirty },
              }) => (
                <View style={styles.inputContainer}>
                  <TextCustom style={styles.label}>Gmail</TextCustom>
                  <CustomTextInput
                    mode="flat"
                    underlineColor="#064944"
                    activeUnderlineColor="#064944"
                    selectionColor="#064944"
                    placeholder="Enter your email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    style={styles.input}
                    error={!!errors.email}
                    contentStyle={{
                      paddingBottom: -10,
                      alignSelf: "flex-start",
                      flex: 1,
                    }}
                    left={
                      <TextInput.Icon
                        icon="account"
                        size={20}
                        color={theme.colors.primary}
                      />
                    }
                    right={
                      isDirty &&
                      !error &&
                      value &&
                      /\S+@\S+\.\S+/.test(value) ? (
                        <TextInput.Icon
                          icon="check-circle"
                          color={theme.colors.primary}
                          size={20}
                        />
                      ) : null
                    }
                  />
                  {errors.email && (
                    <TextCustom style={styles.errorText}>
                      {errors.email.message}
                    </TextCustom>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <TextCustom style={styles.label}>Password</TextCustom>
                  <CustomTextInput
                    mode="flat"
                    underlineColor="#064944"
                    activeUnderlineColor="#064944"
                    selectionColor="#064944"
                    placeholder="Enter your password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry={!showPassword}
                    style={styles.input}
                    outlineStyle={styles.inputOutline}
                    left={
                      <TextInput.Icon
                        icon="lock"
                        size={20}
                        color={theme.colors.primary}
                      />
                    }
                    right={
                      <TextInput.Icon
                        icon={showPassword ? "eye-off" : "eye"}
                        onPress={() => setShowPassword(!showPassword)}
                        color={theme.colors.primary}
                      />
                    }
                    error={!!errors.password}
                  />
                  {errors.password && (
                    <TextCustom style={styles.errorText}>
                      {errors.password.message}
                    </TextCustom>
                  )}
                </View>
              )}
            />
          </VStack>

          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.gradientButton,
              { opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <LinearGradient
              colors={[theme.colors.secondary, theme.colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientBackground}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <TextCustom style={styles.gradientButtonText}>
                  SIGN IN
                </TextCustom>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
