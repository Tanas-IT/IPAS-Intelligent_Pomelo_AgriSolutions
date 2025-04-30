import React, { useState } from "react";
import { Form, Input, Button, Row, Col, Typography } from "antd";
import { forgotPassword } from "@/assets/images/images";
import style from "./ForgetPassword.module.scss";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services";
import { toast } from "react-toastify";
import { RulesManager } from "@/utils";
import { PATHS } from "@/routes";

const { Title, Text } = Typography;

function ForgetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const forgetPassword = async (values: { email: string }) => {
    try {
      setIsLoading(true);
      var result = await authService.sendForgetPassOTP(values.email);
      if (result.statusCode === 200) {
        navigate(PATHS.AUTH.FORGOT_PASSWORD_OTP, { state: { type: "reset", email: values.email } });
      } else {
        toast.warning(result.message);
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
            <Title level={2}>Forgot Your Password?</Title>
            <Form onFinish={forgetPassword}>
              <Form.Item name="email" rules={RulesManager.getEmailRules()} hasFeedback>
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  className={style.inputField}
                />
              </Form.Item>

              <Form.Item>
                <Button loading={isLoading} className={style.btn} htmlType="submit" block>
                  Next
                </Button>
              </Form.Item>
            </Form>

            <a className={style.back} href="/auth?mode=sign-in">
              Back to sign in
            </a>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default ForgetPassword;
