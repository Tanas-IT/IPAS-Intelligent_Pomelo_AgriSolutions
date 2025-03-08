import { Flex, QRCode } from "antd";
import style from "./PlantDetail.module.scss";
import { Icons } from "@/assets";
import { CustomButton } from "@/components";

const DescriptionSection = ({
  description,
  id,
  code,
}: {
  description: string;
  id: number;
  code: string;
}) => {
  const isShortDescription = description.length < 50; // Điều kiện kiểm tra mô tả ngắn
  function doDownload(url: string, fileName: string) {
    const a = document.createElement("a");
    a.download = fileName;
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Giải phóng bộ nhớ
  }

  const downloadSvgQRCode = () => {
    const svg = document.getElementById("myqrcode")?.querySelector<SVGElement>("svg");
    const svgData = new XMLSerializer().serializeToString(svg!);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    doDownload(url, `QRCode-${code}.svg`);
  };
  const baseUrl = import.meta.env.VITE_APP_BASE_URL;
  return (
    <Flex className={style.descriptionSection}>
      <Flex className={`${style.infoField} ${style.infoFieldColumn}`}>
        {isShortDescription ? (
          // Nếu mô tả ngắn, hiển thị trong cùng một dòng
          <Flex className={style.infoField}>
            <Flex className={style.fieldLabelWrapper}>
              <Icons.description className={style.fieldIcon} />
              <label className={style.fieldLabel}>Description:</label>
            </Flex>
            <label className={style.fieldValue}>{description}</label>
          </Flex>
        ) : (
          // Nếu mô tả dài, hiển thị thành nhiều dòng
          <>
            <Flex className={style.fieldLabelWrapper}>
              <Icons.description className={style.fieldIcon} />
              <label className={style.fieldLabel}>Description:</label>
            </Flex>
            <label className={style.fieldValue}>{description}</label>
          </>
        )}
        <Flex vertical gap={10} justify="center">
          <QRCode
            id="myqrcode"
            type="svg"
            value={`${baseUrl}/farm/plants/${id}/details`}
            size={180}
          />
          <CustomButton label="Download" handleOnClick={downloadSvgQRCode} />
        </Flex>
      </Flex>
    </Flex>
  );
};
export default DescriptionSection;
