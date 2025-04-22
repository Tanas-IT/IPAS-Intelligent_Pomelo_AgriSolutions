import { Button, DatePicker, Form, Input, Radio, Typography, Flex } from "antd";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import dayjs from "dayjs";

import { DATE_FORMAT, formatDate, formatDateReq, getUserId } from "@/utils";
import { UserAvatar } from "@/components";

import style from "./ProfileInfo.module.scss";
import { GetUser2 } from "@/payloads";
import { userService } from "@/services";
import { useUserStore } from "@/stores";
import { GENDER_OPTIONS } from "@/constants";

const { Title } = Typography;

const ProfileInfo: React.FC = () => {
  const [form] = Form.useForm();
  const [userData, setUserData] = useState<GetUser2>();
  const [isChanged, setIsChanged] = useState<boolean>(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchUser = async () => {
    const res = await userService.getUser(Number(getUserId()));
    if (res.statusCode === 200 && res.data) {
      setUserData(res.data);

      form.setFieldsValue({
        ...res.data,
        dob: dayjs(res.data.dob),
      });
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const onValuesChange = () => setIsChanged(true);
  const handleChooseFile = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const res = await userService.updateAvatarUser(file);

      if (res.statusCode === 200 && res.data) {
        toast.success(res.message);
        const updatedUser = res.data;
        setUserData(updatedUser);
        useUserStore.getState().setUserInfo(updatedUser.fullName, updatedUser.avatarURL || "");
      } else {
        toast.error(res.message);
      }
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleUpdate = async () => {
    const values = await form.validateFields();
    const payload = {
      ...values,
      userId: userData?.userId,
      dob: formatDateReq(form.getFieldValue("dob")) || undefined,
    };
    const res = await userService.updateUser(payload);
    if (res.statusCode === 200 && res.data) {
      const updatedUser = res.data;
      toast.success(res.message);
      setUserData(updatedUser);
      setIsChanged(false);
      useUserStore.getState().setUserInfo(updatedUser.fullName, updatedUser.avatarURL || "");
    } else {
      toast.error(res.message);
    }
  };

  const handleReset = () => {
    if (!userData) return;
    form.setFieldsValue({
      ...userData,
      dob: dayjs(userData.dob),
    });
    setIsChanged(false);
  };

  if (!userData) return null;

  return (
    <Flex className={style.container}>
      <Title level={4}>Profile Information</Title>

      <Flex className={style.headerRow} align="center" gap={16}>
        <UserAvatar size={120} avatarURL={userData.avatarURL} />
        <Button onClick={handleChooseFile} loading={isUploadingAvatar}>
          Upload New
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          style={{ display: "none" }}
        />
      </Flex>

      <Form form={form} layout="vertical" className={style.form} onValuesChange={onValuesChange}>
        <Flex wrap="wrap" gap={16}>
          <Form.Item name="fullName" label="Full Name" className={style.formItemHalf}>
            <Input />
          </Form.Item>

          <Form.Item name="email" label="Email" className={style.formItemHalf}>
            <Input readOnly />
          </Form.Item>

          <Form.Item name="phoneNumber" label="Phone Number" className={style.formItemHalf}>
            <Input />
          </Form.Item>

          <Form.Item name="dob" label="Date of Birth" className={style.formItemHalf}>
            <DatePicker style={{ width: "100%" }} format={DATE_FORMAT} />
          </Form.Item>

          <Form.Item name="gender" label="Gender" className={style.formItemHalf}>
            <Radio.Group>
              {GENDER_OPTIONS.map((option) => (
                <Radio key={option.value} value={option.value}>
                  {option.label}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>

          <Form.Item label="Account Created On" className={style.fullWidth}>
            <Input value={formatDate(userData.createDate)} readOnly />
          </Form.Item>
        </Flex>

        {/* Footer buttons */}
        <Flex justify="end" style={{ marginTop: 24 }}>
          <Flex gap={20}>
            <Button onClick={handleReset} disabled={!isChanged}>
              Reset changes
            </Button>
            <Button type="primary" onClick={handleUpdate} disabled={!isChanged}>
              Update profile
            </Button>
          </Flex>
        </Flex>
      </Form>
    </Flex>
  );
};

export default ProfileInfo;
