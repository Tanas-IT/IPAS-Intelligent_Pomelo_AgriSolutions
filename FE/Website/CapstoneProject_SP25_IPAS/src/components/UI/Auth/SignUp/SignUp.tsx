import React, { useEffect, useState } from "react";
import { Input, Button, DatePicker, Select, Form, Row, Col, Divider } from "antd";
import style from "./SignUp.module.scss";
import { useLocation, useNavigate } from "react-router-dom";
import { useStyle } from "@/hooks";
import { GoogleCredentialResponse } from "@react-oauth/google";
import { GoogleLoginButton } from "@/components";
import { DATE_FORMAT, RulesManager } from "@/utils";
import dayjs from "dayjs";
import { authService } from "@/services";
import { toast } from "react-toastify";
import { PATHS } from "@/routes";

interface Props {
  toggleForm: () => void;
  isSignUp: boolean;
  handleGoogleLoginSuccess: (response: GoogleCredentialResponse) => Promise<void>;
}

const SignUp: React.FC<Props> = ({ toggleForm, isSignUp, handleGoogleLoginSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();
  const { styles } = useStyle();

  useEffect(() => {
    if (!isSignUp) {
      form.resetFields();
    }
  }, [isSignUp, form]);

  useEffect(() => {
    const values = location.state?.formRegister;
    if (values) {
      values.dateOfBirth = dayjs(values.dateOfBirth);
      form.setFieldsValue(values);
    }
  }, []);

  const handleSignUp = async (values: any) => {
    try {
      if (values.dateOfBirth && values.dateOfBirth.isValid())
        values.dateOfBirth = values.dateOfBirth.format("YYYY-MM-DD");
      setIsLoading(true);
      var result = await authService.sendOTP(values.email);
      if (result.statusCode === 200) {
        navigate(PATHS.AUTH.SIGN_UP_OTP, {
          state: { type: "sign-up", values, otp: result.data.otpHash },
        });
      } else if (result.statusCode === 400) {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error in handleSignUp:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`${style["form-container"]} ${style["sign-up"]} ${!isSignUp ? style.hidden : ""}`}
      style={{ padding: "50px 100px" }}
    >
      <h1 style={{ fontSize: "30px", marginBottom: "30px", textAlign: "center" }}>
        Create Your Account
      </h1>

      <Form
        name="sign_up"
        form={form}
        initialValues={{ remember: true }}
        layout="vertical"
        style={{ maxWidth: "550px", margin: "0 auto", fontSize: "16px" }}
        onFinish={handleSignUp}
      >
        <Form.Item
          style={{ marginBottom: "35px" }}
          name="fullName"
          rules={RulesManager.getFullNameRules()}
          hasFeedback
        >
          <Input
            placeholder="Full Name"
            style={{
              backgroundColor: "white",
              borderRadius: "6px",
              border: "1px solid #d9d9d9",
              fontSize: "16px",
              margin: "0px",
            }}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              style={{ marginBottom: "35px" }}
              name="email"
              rules={RulesManager.getEmailRules()}
              hasFeedback
            >
              <Input
                placeholder="Email"
                style={{
                  backgroundColor: "white",
                  borderRadius: "6px",
                  border: "1px solid #d9d9d9",
                  fontSize: "16px",
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              style={{ marginBottom: "35px" }}
              name="phoneNumber"
              rules={RulesManager.getPhoneNumberRules()}
              hasFeedback
            >
              <Input
                placeholder="Phone Number"
                style={{
                  backgroundColor: "white",
                  borderRadius: "6px",
                  border: "1px solid #d9d9d9",
                  fontSize: "16px",
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              style={{ marginBottom: "35px" }}
              name="dateOfBirth"
              rules={RulesManager.getDOBRules()}
              hasFeedback
            >
              <DatePicker
                placeholder="DD/MM/YYYY"
                format={DATE_FORMAT}
                style={{ width: "100%", fontSize: "16px" }}
                className={`${styles.customInput}`}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              style={{ marginBottom: "35px" }}
              name="gender"
              rules={RulesManager.getGenderRules()}
              hasFeedback
            >
              <Select
                placeholder="Gender"
                style={{ height: "43px", fontSize: "16px" }}
                className={`${styles.customPlaceholder}`}
              >
                <Select.Option value="male">Male</Select.Option>
                <Select.Option value="female">Female</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          style={{ marginBottom: "35px" }}
          name="password"
          rules={RulesManager.getPasswordRules()}
          hasFeedback
        >
          <Input.Password placeholder="Password" className={`${styles.customInput}`} />
        </Form.Item>

        <Form.Item
          style={{ marginBottom: "35px" }}
          name="confirmPassword"
          hasFeedback
          rules={[
            { required: true, message: "Please confirm your password!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("The two passwords do not match!"));
              },
            }),
          ]}
        >
          <Input.Password placeholder="Confirm Password" className={`${styles.customInput}`} />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={isLoading}
            style={{ backgroundColor: "#326E2F", marginTop: "10px" }}
          >
            Sign Up
          </Button>
        </Form.Item>

        <Divider>OR</Divider>

        <GoogleLoginButton onSuccess={handleGoogleLoginSuccess} />
      </Form>
    </div>
  );
};

export default SignUp;
