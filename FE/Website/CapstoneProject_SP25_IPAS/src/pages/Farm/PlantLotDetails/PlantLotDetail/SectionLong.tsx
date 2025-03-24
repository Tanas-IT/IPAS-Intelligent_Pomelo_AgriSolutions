import { Flex, QRCode } from "antd";
import style from "./PlantLotDetail.module.scss";
import { Icons } from "@/assets";
import { CustomButton } from "@/components";
import { usePlantLotStore, usePlantStore } from "@/stores";

const SectionLong = ({}: {}) => {
  const { lot } = usePlantLotStore();
  if (!lot) return;
  const note = lot?.note ?? "N/A";
  const isShortNote = note.length < 50; // Điều kiện kiểm tra mô tả ngắn

  return (
    <Flex className={style.SectionLong}>
      <Flex className={`${style.infoField} ${style.infoFieldColumn}`}>
        {isShortNote ? (
          // Nếu mô tả ngắn, hiển thị trong cùng một dòng
          <Flex className={style.infoField}>
            <Flex className={style.fieldLabelWrapper}>
              <Icons.description className={style.fieldIcon} />
              <label className={style.fieldLabel}>Note:</label>
            </Flex>
            <label className={style.fieldValue}>{lot.note}</label>
          </Flex>
        ) : (
          // Nếu mô tả dài, hiển thị thành nhiều dòng
          <>
            <Flex className={style.fieldLabelWrapper}>
              <Icons.description className={style.fieldIcon} />
              <label className={style.fieldLabel}>Note:</label>
            </Flex>
            <label className={style.fieldValue}>{lot.note}</label>
          </>
        )}
      </Flex>
    </Flex>
  );
};
export default SectionLong;
