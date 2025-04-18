import { Flex, Form } from "antd";
import { useEffect } from "react";
import { FormFieldModal, ModalForm } from "@/components";
import { formatDateReq, RulesManager } from "@/utils";
import { USER_ROLE_OPTIONS, userFormFields } from "@/constants";
import { GetUser2, UserRequest } from "@/payloads";
import dayjs from "dayjs";

type UserModalProps = {
  isOpen: boolean;
  onClose: (values: UserRequest, isUpdate: boolean) => void;
  onSave: (values: UserRequest) => void;
  isLoadingAction?: boolean;
  userData?: GetUser2;
};

const UserModal = ({ isOpen, onClose, onSave, userData, isLoadingAction }: UserModalProps) => {
  const [form] = Form.useForm();
  const isUpdate = userData !== undefined && Object.keys(userData).length > 0;

  const resetForm = () => {
    form.resetFields();
  };

  useEffect(() => {
    resetForm();
    if (isOpen && userData) {
      form.setFieldsValue({ ...userData, dob: dayjs(userData.dob) });
    }
  }, [isOpen, userData]);

  const getFormData = (): UserRequest => {
    const rawData = Object.fromEntries(
      Object.values(userFormFields).map((field) => [field, form.getFieldValue(field)]),
    );

    return {
      ...rawData,
      dob: rawData.dob ? formatDateReq(rawData.dob) : undefined,
    } as UserRequest;
  };

  const handleOk = async () => {
    await form.validateFields();
    // console.log(getFormData());
    onSave(getFormData());
  };

  const handleCancel = () => onClose(getFormData(), isUpdate);

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={handleCancel}
      onSave={handleOk}
      isUpdate={isUpdate}
      isLoading={isLoadingAction}
      title={isUpdate ? "Update User" : "Add New User"}
      size="large"
    >
      <Form form={form} layout="vertical">
        <Flex gap={20}>
          <FormFieldModal
            label="FullName"
            name={userFormFields.fullName}
            rules={RulesManager.getRequiredRules("FullName")}
          />
          <FormFieldModal
            label="Email"
            name={userFormFields.email}
            rules={RulesManager.getEmailRules()}
            readonly={isUpdate}
          />
        </Flex>

        {!isUpdate && (
          <Flex gap={20}>
            <FormFieldModal
              type="password"
              label="Password"
              name={userFormFields.password}
              rules={RulesManager.getPasswordRules()}
            />

            <FormFieldModal
              type="password"
              label="Confirm Password"
              name={"confirmPassword"}
              rules={[
                ...RulesManager.getRequiredRules("Confirm Password"),
                {
                  validator: async (_: any, value: number | string) => {
                    const password = form.getFieldValue(userFormFields.password);
                    if (!value || password === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("The two passwords do not match!"));
                  },
                },
              ]}
            />
          </Flex>
        )}

        <Flex gap={20}>
          <FormFieldModal
            label="Phone Number"
            name={userFormFields.phoneNumber}
            rules={RulesManager.getPhoneNumberNotRequiredRules()}
          />
          <FormFieldModal type="date" label="Dob" name={userFormFields.dob} />
        </Flex>
        <Flex gap={20}>
          <FormFieldModal
            type="select"
            label="Gender"
            name={userFormFields.gender}
            options={[
              { label: "Male", value: "Male" },
              { label: "Female", value: "Female" },
            ]}
          />

          <FormFieldModal
            label="Role"
            name={userFormFields.roleName}
            rules={RulesManager.getRequiredRules("Role")}
            type="select"
            options={USER_ROLE_OPTIONS}
          />
        </Flex>
      </Form>
    </ModalForm>
  );
};

export default UserModal;
