import { Flex } from "antd";
import style from "./Section.module.scss";
import CustomButton from "../../Button/CustomButton";
import { Icons } from "@/assets";

interface SectionProps {
  title: React.ReactNode;
  subtitle: string;
  children: React.ReactNode;
  actionButton?: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, subtitle, children, actionButton}) => (
  <Flex className={style.contentSection}>
    <Flex className={style.contentSectionLeft}>
      <label className={style.sectionTitle}>{title}</label>
      <label className={style.subTitle}>{subtitle}</label>
      {actionButton && <div className={style.actionButton}>{actionButton}</div>}
    </Flex>
    <Flex className={style.contentSectionRight}>{children}</Flex>
  </Flex>
);

export default Section;
