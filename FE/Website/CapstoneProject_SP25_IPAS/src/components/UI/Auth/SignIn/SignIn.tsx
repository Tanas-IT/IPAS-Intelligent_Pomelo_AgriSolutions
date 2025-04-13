import React, { useEffect, useState } from "react";
import { Input, Button, Form, Divider, Flex } from "antd";
import style from "./SignIn.module.scss";
import { GoogleCredentialResponse } from "@react-oauth/google";
import { GoogleLoginButton } from "@/components";
import { useLocalStorage, useStyle } from "@/hooks";
import { getRoleId, RulesManager } from "@/utils";
import { authService } from "@/services";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes";
import { toast } from "react-toastify";

import { UserRole, UserRolesStr } from "@/constants";

interface Props {
  toggleForm: () => void;
  isSignUp: boolean;
  handleGoogleLoginSuccess: (response: GoogleCredentialResponse) => Promise<void>;
}

const SignIn: React.FC<Props> = ({ toggleForm, isSignUp, handleGoogleLoginSuccess }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { styles } = useStyle();
  const [form] = Form.useForm();

  useEffect(() => {
    if (!isSignUp) {
      form.resetFields();
    }
  }, [isSignUp, form]);

  const handleSubmit = async (values: any) => {
    try {
      setIsLoading(true);
      const result = await authService.login(values.email, values.password);
      const toastMessage = result.message;
      if (result.statusCode === 200) {
        const { saveAuthData } = useLocalStorage();
        const accessToken = result.data.authenModel.accessToken;
        const loginResponse = {
          accessToken: accessToken,
          refreshToken: result.data.authenModel.refreshToken,
          fullName: result.data.fullname,
          avatar: result.data.avatar,
        };
        saveAuthData(loginResponse);
        const roleId = getRoleId();

        if (roleId === UserRolesStr.User)
          navigate(PATHS.FARM_PICKER, { state: { toastMessage } });
        if (roleId === UserRolesStr.Admin)
          navigate(PATHS.USER.USER_LIST, { state: { toastMessage } });
        // if (roleId === UserRole..toString())
        //   navigate(PATHS.USER.USER_LIST, { state: { toastMessage } });
      } else if (result.statusCode === 400 || result.statusCode === 500) {
        toast.error(toastMessage);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`${style["form-container"]} ${style["sign-in"]} ${isSignUp ? style.hidden : ""}`}
    >
      <Form
        name="sign_in"
        form={form}
        onFinish={handleSubmit}
        initialValues={{ remember: true }}
        layout="vertical"
      >
        <h1 className={style.formTitle}>Sign In</h1>

        <div className={style["inputGroup"]}>
          <Form.Item name="email" rules={RulesManager.getEmailRules()} hasFeedback>
            <Input
              placeholder="Email"
              style={{
                fontSize: "16px",
                backgroundColor: "white",
                borderRadius: "6px",
                border: "1px solid #d9d9d9",
              }}
            />
          </Form.Item>

          <Form.Item name="password" rules={RulesManager.getPasswordRules()} hasFeedback>
            <Input.Password placeholder="Password" className={`${styles.customInput}`} />
          </Form.Item>
        </div>

        <Flex className={style.forgetWrapper}>
          <a href={PATHS.AUTH.FORGOT_PASSWORD} className={style["forgetpw"]}>
            Forgot Password?
          </a>
        </Flex>

        <Form.Item>
          <Button
            loading={isLoading}
            type="primary"
            htmlType="submit"
            block
            className={style.btn_signin}
          >
            Sign In
          </Button>
        </Form.Item>

        <Divider>OR</Divider>

        <GoogleLoginButton onSuccess={handleGoogleLoginSuccess} />
      </Form>
    </div>
  );
};

export default SignIn;
