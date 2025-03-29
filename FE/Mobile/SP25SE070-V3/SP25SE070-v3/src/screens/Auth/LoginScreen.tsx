import React, { useState } from "react";
import { View, StyleSheet, Pressable, SafeAreaView } from "react-native";
import { TextInput, Button, Text, ActivityIndicator } from "react-native-paper";
import { LinearGradient } from 'expo-linear-gradient';
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "@/validations/authSchemas";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { VStack } from "native-base";
import { AuthNavigationProp } from "@/navigation/Types";
import { ROUTE_NAMES } from "@/navigation/RouteNames";
import { authService } from "@/services";

type FormData = {
  email: string;
  password: string;
};

export const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation<AuthNavigationProp>();
  const {
    control,
    handleSubmit,
    formState: { errors },
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
      console.log("Login data:", data);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      Toast.show({
        type: "success",
        text1: "Đăng nhập thành công",
      });

      navigation.navigate(ROUTE_NAMES.MAIN.DRAWER, { 
        screen: ROUTE_NAMES.MAIN.MAIN_TABS 
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Đăng nhập thất bại",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // const onSubmit = async (data: FormData) => {
  //   setIsLoading(true);
  //   try {
  //     console.log("Login data:", data);
      
  // const response = await authService.login(data.email, data.password);
  //     if (response.statusCode === 200) {
  //       Toast.show({
  //         type: 'success',
  //         text1: 'Đăng nhập thành công',
  //       });
  //     } else {
  //       Toast.show({
  //         type: 'error',
  //         text1: response.message || 'Đăng nhập thất bại',
  //       });
  //     }
  //   } catch (error) {
  //     Toast.show({
  //       type: 'error',
  //       text1: 'Đã xảy ra lỗi khi đăng nhập',
  //     });
  //     console.error('Login error:', error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  return (
    <View style={styles.container}>
      <LinearGradient
        // colors={['#D3F0E5', '#FEE69C']}
        // colors={['#4ca784', '#064944']}
        colors={['#BCD379', '#064944']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <SafeAreaView style={styles.hello}>
          <Text variant="headlineLarge" style={styles.header}>
            Hello
          </Text>
          <Text variant="headlineMedium" style={styles.subHeader}>
            Sign in!
          </Text>
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
                fieldState: { error, isDirty } }) => (
                <View style={styles.inputContainer}>
                  <Text variant="labelLarge" style={styles.label}>
                    Gmaill
                  </Text>
                  <TextInput
                    mode="flat"
                    underlineColor="#064944"
                    activeUnderlineColor="#064944"
                    selectionColor="#064944"
                    placeholder="Joydaoe@gmail.com"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    style={styles.input}
                    error={!!errors.email}
                    contentStyle={{
                      paddingBottom: -10,
                      alignSelf: 'flex-start',
                      flex: 1
                    }}
                    right={
                      isDirty && !error && value && /\S+@\S+\.\S+/.test(value) ? (
                        <TextInput.Icon
                          icon="check-circle"
                          color="#4CAF50"
                          size={20}
                        />
                      ) : null
                    }
                  />
                  {errors.email && (
                    <Text style={styles.errorText}>
                      {errors.email.message}
                    </Text>
                  )}
                </View>
              )}
            />

            {/* Password Input */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <Text variant="labelLarge" style={styles.label}>
                    Password
                  </Text>
                  <TextInput
                    mode="flat"
                    underlineColor="#064944"
                    activeUnderlineColor="#064944"
                    selectionColor="#064944"
                    placeholder="*********"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry={!showPassword}
                    style={styles.input}
                    outlineStyle={styles.inputOutline}
                    // left={<TextInput.Icon icon="lock" size={20} />}
                    right={
                      <TextInput.Icon
                        icon={showPassword ? "eye-off" : "eye"}
                        onPress={() => setShowPassword(!showPassword)}
                      />
                    }
                    error={!!errors.password}
                  />
                  {errors.password && (
                    <Text style={styles.errorText}>
                      {errors.password.message}
                    </Text>
                  )}
                </View>
              )}
            />
          </VStack>

          {/* Forgot Password */}
          <Pressable
            style={styles.forgotPassword}
            onPress={() => console.log("Forgot password pressed")}
          >
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </Pressable>

          {/* Sign In Button */}
          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.gradientButton,
              { opacity: pressed ? 0.8 : 1 }
            ]}
          >
            <LinearGradient
              // colors={['#D3F0E5', '#FEE69C']}
              colors={['#BCD379', '#064944']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientBackground}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.gradientButtonText}>SIGN IN</Text>
              )}
            </LinearGradient>
          </Pressable>

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have account?</Text>
            <Pressable onPress={() => console.log("Sign up pressed")}>
              <Text style={styles.signUpLink}>Sign up</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 24,
  },
  hello: {
    marginBottom: 30,
    marginTop: 30,
    marginLeft: 10
  },
  header: {
    fontWeight: "bold",
    marginBottom: 4,
    color: 'white',
  },
  subHeader: {
    fontWeight: "bold",
    marginBottom: 10,
    color: 'white',
  },
  formContainer: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: -35, // Kéo lên để che phần bo tròn
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 30,
  },
  formContent: {
    paddingHorizontal: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 0,
    marginLeft: 17,
    color: '#173F15',
    fontWeight: "600",
    fontSize: 16
  },
  input: {
    backgroundColor: "white",
    padding: -5
  },
  inputOutline: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 0
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
    color: '#000000'
  },
  forgotPasswordText: {
    color: "#064944",
    fontSize: 14,
    fontWeight: '500',
  },
  signInButton: {
    borderRadius: 8,
    paddingVertical: 8,
    marginBottom: 16,
    backgroundColor: "#4285F4",
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  signUpText: {
    fontSize: 14,
    marginRight: 4,
    color: '#666',
  },
  signUpLink: {
    fontSize: 14,
    color: "#064944",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 4,
    marginLeft: 12,
    fontStyle: 'italic',
  },
  gradientButton: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    marginTop: 20
  },
  gradientBackground: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;