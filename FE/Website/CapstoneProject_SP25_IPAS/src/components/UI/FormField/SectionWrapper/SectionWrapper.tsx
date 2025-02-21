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
  direction?: "row" | "col";
};

const SectionWrapper = ({
  title,
  name,
  rules = [],
  valuePropName = "value",
  description,
  children,
  direction = "col",
}: SectionWrapperProps) => {
  return (
    <Flex className={`${style.formSection} ${style[direction]}`}>
      <Flex className={style.formSectionTitle}>
        <label className={style.formTitle}>{title}</label>
        {description && <span className={style.formDescription}>{description}</span>}
      </Flex>
      <Form.Item name={name} valuePropName={valuePropName} rules={rules}>
        {children}
      </Form.Item>
    </Flex>
  );
};

export default SectionWrapper;
