import { enterOTP } from "@/assets/images/images";
import style from "./OTP.module.scss";
import { Button, Col, Form, Input, Row, Typography } from "antd";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authService } from "@/services";
import { hashOtp } from "@/utils";
import { RegisterRequest } from "@/payloads";
import { useLocalStorage } from "@/hooks";
import { PATHS } from "@/routes";
import { toast } from "react-toastify";
import { useUserStore } from "@/stores";

const { Title, Text } = Typography;

function OTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();
  const TIME_COUNTER = 60 * 5;
  const [timeLeft, setTimeLeft] = useState(TIME_COUNTER);
  const otpRef = useRef<string>(location.state?.otp);
  const formRegisterRef = useRef<any | null>(location.state?.values);
  const emailRef = useRef<string | null>(location.state?.email);
  const type = location.state?.type;

  const instructions =
    type === "sign-up"
      ? "A verification code has been sent to your email. Please enter the code to verify your account."
      : "An OTP has been sent to your email to reset your password. Please enter the code below.";

  useEffect(() => {
    // Kiểm tra `timeLeft` từ localStorage
    const storedTime = localStorage.getItem("otpTimeLeft");
    const now = Date.now();
    const savedTimeLeft = storedTime ? parseInt(storedTime) : 0;

    if (savedTimeLeft > now) {
      // Nếu thời gian chưa hết hạn, tính `timeLeft` còn lại
      setTimeLeft(Math.ceil((savedTimeLeft - now) / 1000));
    } else {
      // Nếu hết hạn, đặt lại về 60 giây
      setTimeLeft(TIME_COUNTER);
    }

    // Xóa timeout khi rời khỏi trang
    return () => {
      localStorage.removeItem("otpTimeLeft");
    };
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      // Lưu lại thời gian hết hạn vào localStorage
      const expiryTime = Date.now() + timeLeft * 1000;
      localStorage.setItem("otpTimeLeft", expiryTime.toString());

      const timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      // Khi hết thời gian, xóa giá trị lưu trong localStorage
      localStorage.removeItem("otpTimeLeft");
    }
  }, [timeLeft]);

  const validateOtp = async (otp: string, shouldHash = true) => {
    if (timeLeft <= 0) {
      form.setFields([
        {
          name: "otp",
          errors: ["The OTP has expired. Please request a new one!"],
        },
      ]);
      return false;
    }

    if (shouldHash) {
      const hashedOtp = await hashOtp(otp);

      if (hashedOtp !== otpRef.current) {
        form.setFields([
          {
            name: "otp",
            errors: ["The OTP you entered is incorrect. Please try again!"],
          },
        ]);
        return false;
      }
    }

    return true;
  };

  const handleFinalRegister = async (values: { otp: string }) => {
    if (!(await validateOtp(values.otp, true))) return;

    try {
      setIsLoading(true);
      const registerRequest: RegisterRequest = {
        email: formRegisterRef.current.email,
        password: formRegisterRef.current.password,
        fullName: formRegisterRef.current.fullName,
        phone: formRegisterRef.current.phoneNumber,
        gender: formRegisterRef.current.gender === "male" ? "Male" : "Female",
        dob: formRegisterRef.current.dateOfBirth,
      };

      var result = await authService.register(registerRequest);
      if (result.statusCode === 200) {
        const { saveAuthData } = useLocalStorage();
        const registerResponse = {
          accessToken: result.data.authenModel.accessToken,
          refreshToken: result.data.authenModel.refreshToken,
          fullName: result.data.fullname,
          avatar: result.data.avatar,
        };

        saveAuthData(registerResponse);
        useUserStore.getState().setUserInfo(result.data.fullname, result.data.avatar);
        const toastMessage = result.message;
        navigate(PATHS.FARM_PICKER, { state: { toastMessage } });
      } else if (result.statusCode === 400) {
        toast.warning(result.message);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgetOtpConfirm = async (values: { otp: string }) => {
    if (!(await validateOtp(values.otp, false))) return;

    try {
      setIsLoading(true);
      if (!emailRef.current) return;
      var result = await authService.forgetPassOTPConfirm(emailRef.current, values.otp);
      if (result.statusCode === 200) {
        navigate(PATHS.AUTH.FORGOT_PASSWORD_RESET, {
          state: { email: emailRef.current, otp: values.otp },
        });
      } else {
        form.setFields([
          {
            name: "otp",
            errors: ["The OTP you entered is incorrect. Please try again!"],
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      var result = await authService.sendOTP(formRegisterRef.current.email);
      if (result.statusCode === 200) {
        otpRef.current = result.data.otpHash;
        setTimeLeft(TIME_COUNTER);
      }
    } catch (error) {
      console.error("Error in handleSignUp:", error);
    }
  };

  const handleResendPasswordOTP = async () => {
    try {
      if (!emailRef.current) return;
      var result = await authService.sendForgetPassOTP(emailRef.current);
      if (result.statusCode === 200) {
        setTimeLeft(TIME_COUNTER);
      }
    } catch (error) {
      console.error("Error in handleSignUp:", error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? `0${mins}` : mins}:${secs < 10 ? `0${secs}` : secs}`;
  };

  return (
    <div className={style.container}>
      <Row justify="center" align="middle" gutter={32}>
        <Col xs={24} sm={12} md={12}>
          <img src={enterOTP} alt="Enter OTP gif" className={style.otpImg} />
        </Col>

        <Col xs={24} sm={12} md={8}>
          <div className={style.formContainer}>
            <Title level={2} className={style.title}>
              Enter OTP
            </Title>
            <Text className={style.infoText}>{instructions}</Text>
            <div className={style.timerContainer}>
              <Text>Time Remaining:</Text>
              <span className={style.timer}>{formatTime(timeLeft)}</span>
            </div>
            <Form
              form={form}
              onFinish={type === "sign-up" ? handleFinalRegister : handleForgetOtpConfirm}
              layout="vertical"
              className={style.form}
            >
              <Form.Item
                name="otp"
                validateTrigger="onChange"
                rules={[
                  { required: true, message: "Please enter the OTP!" },
                  { len: 6, message: "OTP must be 6 digits!" },
                ]}
                className={style.inputOpt}
              >
                <Input.OTP inputMode="numeric" />
              </Form.Item>

              <Form.Item>
                <Row gutter={16}>
                  <Col span={12}>
                    <Button
                      type="default"
                      onClick={type === "sign-up" ? handleResendOTP : handleResendPasswordOTP}
                      block
                      disabled={timeLeft > 0}
                      className={style.resendButton}
                    >
                      Resend OTP
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button
                      loading={isLoading}
                      type="primary"
                      htmlType="submit"
                      block
                      className={style.verifyBtn}
                    >
                      Verify OTP
                    </Button>
                  </Col>
                </Row>
              </Form.Item>
            </Form>
            <div className={style.back}>
              <a
                onClick={() => {
                  navigate(
                    type === "sign-up" ? PATHS.AUTH.Register : PATHS.AUTH.LOGIN2,
                    type === "sign-up" ? { state: { formRegister: formRegisterRef.current } } : {},
                  );
                }}
              >
                {type === "sign-up" ? "Back to sign up" : "Back to sign in"}
              </a>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default OTP;
