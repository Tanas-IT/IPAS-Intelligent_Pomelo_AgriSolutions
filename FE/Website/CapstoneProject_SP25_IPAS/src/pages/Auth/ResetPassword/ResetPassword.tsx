import React, { useEffect, useRef, useState } from "react";
import { Form, Input, Button, Row, Col, Typography } from "antd";
import { forgotPassword } from "@/assets/images/images";
import style from "./ResetPassword.module.scss";
import { useLocation, useNavigate } from "react-router-dom";
import { authService } from "@/services";
import { toast } from "react-toastify";
import { RulesManager } from "@/utils";
import { PATHS } from "@/routes";
import { useStyle } from "@/hooks";

const { Title, Text } = Typography;

function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const { styles } = useStyle();
  const navigate = useNavigate();
  const location = useLocation();
  const otpRef = useRef<string>(location.state?.otp);
  const emailRef = useRef<string>(location.state?.email);

  useEffect(() => {
    if (!otpRef.current && !emailRef.current) {
      const warningMessage = "You do not have permission to access this resource";
      navigate(PATHS.AUTH.LANDING, { state: { warningMessage } });
    }
  }, []);

  const forgetPassword = async (values: { newPassword: string }) => {
    try {
      setIsLoading(true);
      var result = await authService.forgetPassNewPass(
        emailRef.current,
        values.newPassword,
        otpRef.current,
      );
      const toastMessage = result.message;
      if (result.statusCode === 200) {
        navigate(PATHS.AUTH.LOGIN, { state: { toastMessage } });
      } else {
        toast.warning(toastMessage);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={style.forgetPasswordContainer}>
      <Row justify="center" align="middle" gutter={32}>
        <Col xs={24} sm={12} md={12}>
          <img src={forgotPassword} alt="Forgot password gif" className={style.gifImage} />
        </Col>

        <Col xs={24} sm={12} md={8}>
          <div className={style.formContainer}>
            <Title level={2}>Reset Your Password</Title>
            <Form onFinish={forgetPassword}>
              <Form.Item
                style={{ marginBottom: "35px" }}
                name="newPassword"
                rules={RulesManager.getPasswordRules()}
                hasFeedback
              >
                <Input.Password placeholder="New Password" className={`${styles.customInput}`} />
              </Form.Item>

              <Form.Item
                style={{ marginBottom: "35px" }}
                name="confirmPassword"
                hasFeedback
                rules={[
                  { required: true, message: "Please confirm your password!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("The two passwords do not match!"));
                    },
                  }),
                ]}
              >
                <Input.Password
                  placeholder="Confirm Password"
                  className={`${styles.customInput}`}
                />
              </Form.Item>

              <Form.Item>
                <Button loading={isLoading} className={style.btn} htmlType="submit" block>
                  Next
                </Button>
              </Form.Item>
            </Form>

            <a className={style.back} href={PATHS.AUTH.LOGIN2}>
              Back to sign in
            </a>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default ResetPassword;
