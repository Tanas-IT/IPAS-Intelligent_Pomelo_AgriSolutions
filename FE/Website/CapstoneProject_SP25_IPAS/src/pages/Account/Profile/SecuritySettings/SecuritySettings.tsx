import { Button, Form, Input, Typography, Card } from "antd";
import { useState } from "react";
import { toast } from "react-toastify";
import { userService } from "@/services";
import style from "./SecuritySettings.module.scss";
import { RulesManager } from "@/utils";

const { Title } = Typography;

function SecuritySettings() {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async () => {
    try {
      const { oldPassword, newPassword, confirmPassword } = await form.validateFields();

      if (newPassword !== confirmPassword) {
        toast.warning("New passwords do not match!");
        return;
      }

      setIsLoading(true);
      const res = await userService.changePassword(oldPassword, newPassword);

      if (res.statusCode === 200) {
        toast.success(res.message);
        form.resetFields();
      } else {
        toast.warning(res.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={style.container}>
      <Title level={4}>Change Password</Title>
      <Form layout="vertical" form={form} onFinish={handleChangePassword} className={style.form}>
        <Form.Item
          label="Old Password"
          name="oldPassword"
          rules={RulesManager.getPasswordRules()}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="New Password"
          name="newPassword"
          rules={RulesManager.getPasswordRules()}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="Confirm New Password"
          name="confirmPassword"
          dependencies={["newPassword"]}
          rules={[
            ...RulesManager.getRequiredRules("Confirm Password"),
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Passwords do not match"));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>

        <div style={{ display: "flex", justifyContent: "end", marginTop: 24 }}>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Change Password
          </Button>
        </div>
      </Form>
    </div>
  );
}

export default SecuritySettings;
