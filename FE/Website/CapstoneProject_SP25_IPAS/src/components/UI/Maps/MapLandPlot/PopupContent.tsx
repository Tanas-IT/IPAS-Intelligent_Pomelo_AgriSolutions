import React from "react";
import style from "./MapLandPlot.module.scss";
import { Button, Flex, Tag, Typography } from "antd";
const { Text } = Typography;
import { GetLandPlot } from "@/payloads";
import { Icons } from "@/assets";
import { formatDate } from "@/utils";

interface PopupContentProps {
  plot: GetLandPlot;
  onClose: () => void;
}

const PopupContent: React.FC<PopupContentProps> = ({ plot, onClose }) => {
  const handleDelete = () => {
    console.log("Xóa lô đất!");
    // TODO: Gọi API hoặc thực hiện logic xóa ở đây
  };

  const handleUpdate = () => {
    console.log("Cập nhật lô đất!");
    // TODO: Gọi API hoặc mở modal chỉnh sửa
  };

  return (
    <div className={style.popupContainer}>
      <Flex className={style.popupHeader}>
        <h3>Plot Detail</h3>
        <button className={style.popupClose} onClick={onClose}>
          &times;
        </button>
      </Flex>
      <Flex className={style.plotItemWrapper}>
        <Flex className={style.col}>
          <Flex className={style.plotItemHeader}>
            <Flex className={style.row}>
              <Text className={style.plotItemTitle}>
                {plot.landPlotName} - {plot.landPlotCode}
              </Text>
              <Tag
                color={
                  plot.status === "Active" ? "green" : plot.status === "Warning" ? "orange" : "red"
                }
              >
                {plot.status}
              </Tag>
            </Flex>
            <label className={style.plotItemDescription}>{plot.description}</label>
          </Flex>

          {/* Chi tiết đất */}
          <Flex className={style.plotItemDetails}>
            <Flex className={style.plotItemDetail}>
              <Icons.calendar />
              <label>Create Date:</label>
            </Flex>
            {formatDate(plot.createDate)}
          </Flex>

          <Flex className={style.plotItemDetails}>
            <Flex className={style.plotItemDetail}>
              <Icons.area />
              <label>Area:</label>
            </Flex>
            {plot.area} m²
          </Flex>

          <Flex className={style.plotItemDetails}>
            <Flex className={style.plotItemDetail}>
              <Icons.soil />
              <label>Soil Type:</label>
            </Flex>
            {plot.soilType}
          </Flex>

          <Flex className={style.plotItemDetails}>
            <Flex className={style.plotItemDetail}>
              <Icons.target />
              <label>Target Market:</label>
            </Flex>
            {plot.targetMarket}
          </Flex>
        </Flex>
      </Flex>
      <Flex className={style.popupFooter}>
        <Button type="primary" danger onClick={handleDelete} className={style.btn}>
          Delete
        </Button>
        <Button onClick={handleUpdate} className={`${style.btn} ${style.updateBtn}`}>
          Update
        </Button>
      </Flex>
    </div>
  );
};

export default PopupContent;
