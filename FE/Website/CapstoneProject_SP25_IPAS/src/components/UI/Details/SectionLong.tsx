import { Flex } from "antd";
import style from "./Details.module.scss";
import { Icons } from "@/assets";

interface SectionLongProps {
  text?: string; // Nhận giá trị văn bản từ props
}

const SectionLong: React.FC<SectionLongProps> = ({ text = "N/A" }) => {
  const isShortText = text.length < 50; // Kiểm tra độ dài mô tả

  return (
    <Flex>
      <Flex className={`${style.infoField} ${style.infoFieldColumn}`}>
        {isShortText ? (
          // Nếu mô tả ngắn, hiển thị trong cùng một dòng
          <Flex className={style.infoField}>
            <Flex className={style.fieldLabelWrapper}>
              <Icons.description className={style.fieldIcon} />
              <label className={style.fieldLabel}>Note:</label>
            </Flex>
            <label className={style.fieldValue}>{text}</label>
          </Flex>
        ) : (
          // Nếu mô tả dài, hiển thị thành nhiều dòng
          <>
            <Flex className={style.fieldLabelWrapper}>
              <Icons.description className={style.fieldIcon} />
              <label className={style.fieldLabel}>Note:</label>
            </Flex>
            <label className={style.fieldValue}>{text}</label>
          </>
        )}
      </Flex>
    </Flex>
  );
};

export default SectionLong;
