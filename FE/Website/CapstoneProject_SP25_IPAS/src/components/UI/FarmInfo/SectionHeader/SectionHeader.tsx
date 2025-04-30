import React from "react";
import style from "./SectionHeader.module.scss";
import { Flex } from "antd";
import { Icons } from "@/assets";
import EditActions from "../EditActions/EditActions";
import CustomButton from "../../Button/CustomButton";

type SectionHeaderProps = {
  isLoginOwner: boolean;
  title: string;
  subtitle: string;
  isEditing?: boolean;
  handleEdit?: () => void;
  handleCancel?: () => void;
  handleSave?: () => void;
  isDisplayEdit?: boolean;
};

const SectionHeader: React.FC<SectionHeaderProps> = ({
  isLoginOwner,
  title,
  subtitle,
  isEditing = false,
  handleEdit = () => {},
  handleCancel = () => {},
  handleSave = () => {},
  isDisplayEdit = true,
}) => (
  <Flex className={style.contentSectionHeader}>
    <Flex className={style.contentSectionTitle}>
      <Flex className={style.contentSectionTitleLeft}>
        <label className={style.title}>{title}</label>
      </Flex>
      <Flex>
        {isDisplayEdit &&
          isLoginOwner &&
          (isEditing ? (
            <EditActions handleBtn1={handleCancel} handleBtn2={handleSave} />
          ) : (
            <Icons.edit className={style.iconEdit} onClick={handleEdit} />
          ))}
      </Flex>
    </Flex>
    <label className={style.subTitle}>{subtitle}</label>
  </Flex>
);

export default SectionHeader;
