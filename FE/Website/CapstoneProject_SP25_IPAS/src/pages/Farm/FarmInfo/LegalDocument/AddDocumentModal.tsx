import { Flex, Form, Switch } from "antd";
import { useState, useEffect } from "react";
import { InputModal, ModalForm, SelectModal, TagRender } from "@/components";
import style from "../FarmInfo.module.scss";
import { useStyle } from "@/hooks";
import { RulesManager } from "@/utils";

type AddDocumentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: any) => void;
};

const AddDocumentModal = ({ isOpen, onClose, onSave }: AddDocumentModalProps) => {
  const [form] = Form.useForm();
  const { styles } = useStyle();

  const handleOk = async () => {
    const values = await form.validateFields();
    console.log("All Form Values:", values);
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const growthStageOptions = [
    { value: "gold", label: "gold" },
    { value: "2", label: "lime" },
    { value: "3", label: "green" },
    { value: "4", label: "cyan" },
  ];

  const processTypeOptions = [
    { value: "1", label: "type 1" },
    { value: "2", label: "type 2" },
    { value: "3", label: "type 3" },
    { value: "4", label: "type 4" },
  ];

  return (
    <ModalForm isOpen={isOpen} onClose={handleCancel} onSave={handleOk} title="Add New Document">
      <Form onFinish={handleOk} form={form} layout="vertical" className={style.modalContainer}>
        <InputModal
          label="Process Name:"
          name="processName"
          rules={RulesManager.getFarmNameRules()}
          placeholder="Enter the farm name"
        />

        <Flex gap={26}>
          <SelectModal
            label="Growth Stage:"
            name="growthStage"
            rules={RulesManager.getFarmNameRules()}
            options={growthStageOptions}
            form={form}
          />

          <SelectModal
            label="Process Type:"
            name="processType"
            rules={RulesManager.getFarmNameRules()}
            options={processTypeOptions}
            form={form}
          />
        </Flex>

        <Form.Item>
          <Flex style={{ display: "flex", flexDirection: "row", gap: "20px" }}>
            <label className={style.title}>Status:</label>
            <Switch
              style={{ width: "100px", background: "#BCD379" }}
              className={styles.customSwitch}
              checkedChildren="Active"
              unCheckedChildren="Inactive"
              defaultChecked
            />
          </Flex>
        </Form.Item>
      </Form>
    </ModalForm>
  );
};

export default AddDocumentModal;
