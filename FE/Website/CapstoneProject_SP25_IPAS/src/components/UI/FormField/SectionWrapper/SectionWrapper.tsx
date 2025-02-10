import { ReactNode } from "react";
import { Flex, Form } from "antd";
import style from "./SectionWrapper.module.scss";

type SectionWrapperProps = {
  title: string;
  name: string;
  valuePropName?: string;
  rules?: any[];
  description?: string;
  children: ReactNode;
};

const SectionWrapper = ({
  title,
  name,
  rules = [],
  valuePropName = "value",
  description,
  children,
}: SectionWrapperProps) => {
  return (
    <Form.Item
      name={name}
      valuePropName={valuePropName}
      rules={rules}
      className={style.formWrapper}
    >
      <Flex className={style.formSection}>
        <Flex className={style.formSectionTitle}>
          <label className={style.formTitle}>{title}</label>
          {description && <span className={style.formDescription}>{description}</span>}
        </Flex>
        {children}
      </Flex>
    </Form.Item>
  );
};

export default SectionWrapper;
