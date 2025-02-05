import { Flex } from "antd";
import style from "./Section.module.scss";

interface SectionProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, subtitle, children }) => (
  <Flex className={style.contentSection}>
    <Flex className={style.contentSectionLeft}>
      <label className={style.sectionTitle}>{title}</label>
      <label className={style.subTitle}>{subtitle}</label>
    </Flex>
    <Flex className={style.contentSectionRight}>{children}</Flex>
  </Flex>
);

export default Section;
