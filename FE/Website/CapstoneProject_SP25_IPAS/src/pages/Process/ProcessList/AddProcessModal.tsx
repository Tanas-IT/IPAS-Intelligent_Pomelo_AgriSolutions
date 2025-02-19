import { Button, Divider, Flex, Form, Input, Modal, Select, Switch } from "antd";
import { useState, useEffect } from "react";
import { TagRender } from "@/components";
import style from "./ProcessList.module.scss";
import { useStyle } from "@/hooks";

type ProcessModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: any) => void;
};

const ProcessModal = ({ isOpen, onClose, onSave }: ProcessModalProps) => {
  const [form] = Form.useForm();
  const { styles } = useStyle();
  const [processTypeSelected, setProcessTypeSelected] = useState<string>();
  const [growthStageSelected, setGrowthStageSelected] = useState<string>();

  useEffect(() => {
    form.setFieldsValue({
      growthStage: growthStageSelected,
      processType: processTypeSelected,
    });
  }, [isOpen, growthStageSelected, processTypeSelected]);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        console.log("Form Values:", values);

        onSave({
          ...values,
          processType: processTypeSelected,
          growthStage: growthStageSelected,
        });
        form.resetFields();
        setProcessTypeSelected("");
        setGrowthStageSelected("");
      })
      .catch((info) => {
        console.log("Validation Failed:", info);
      });
  };

  const handleCancel = () => {
    form.resetFields();
    setProcessTypeSelected("");
    setGrowthStageSelected("");
    onClose();
  };

  const growthStageOptions = [
    { value: "gold" },
    { value: "lime" },
    { value: "green" },
    { value: "cyan" },
    { value: "ds" },
    { value: "as" },
  ];

  const processTypeOptions = [
    { value: "type 1" },
    { value: "type 2" },
    { value: "type 3" },
    { value: "type 4" },
  ];

  return (
    <Modal
      open={isOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="Save"
      cancelText="Cancel"
      footer={[
        <Button key="back" onClick={handleCancel} style={{ border: "none" }}>
          Cancel
        </Button>,
        <Button key="submit" onClick={handleOk} className={style.btnAdd}>
          Add Process
        </Button>,
      ]}
    >
      <div>
        <h2 className={style.titleModal}>Add New Process</h2>
        <Divider style={{ margin: "10px 0" }} />
      </div>
      <Form form={form} layout="vertical">
        <Form.Item
          name="processName"
          rules={[{ required: true, message: "Please enter the process name!" }]}
        >
          <Flex className={style.section}>
            <label className={style.title}>Process Name:</label>
            <Input placeholder="Enter process name" />
          </Flex>
        </Form.Item>

        <Flex gap={26}>
          <Form.Item
            name="growthStage"
            style={{ flex: 1 }}
            rules={[{ required: true, message: "Please select growth stage!" }]}
          >
            <Flex className={style.section}>
              <label className={style.title}>Growth Stage:</label>
              <Select
                placeholder="Select growth stage"
                tagRender={TagRender}
                options={growthStageOptions}
                value={growthStageSelected}
                onChange={(value) => setGrowthStageSelected(value)}
              />
            </Flex>
          </Form.Item>

          <Form.Item
            name="processType"
            style={{ flex: 1 }}
            rules={[{ required: true, message: "Please select process type!" }]}
          >
            <Flex className={style.section}>
              <label className={style.title}>Process Type:</label>
              <Select
                placeholder="Select process type"
                tagRender={TagRender}
                options={processTypeOptions}
                value={processTypeSelected}
                onChange={(value) => setProcessTypeSelected(value)}
              />
            </Flex>
          </Form.Item>
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
    </Modal>
  );
};

export default ProcessModal;
