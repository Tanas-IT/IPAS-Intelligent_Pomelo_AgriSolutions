import React from "react";
import { Popover } from "antd";

interface PolygonPopupProps {
  lat: number;
  lng: number;
  data?: { id: string };
  containerRef: HTMLElement | null;
}

const PolygonPopup: React.FC<PolygonPopupProps> = ({ lat, lng, data, containerRef }) => {
  return (
    <Popover
      content={<div>Thông tin: {data?.id}</div>}
      title="Chi tiết Polygon"
      placement="top"
      getPopupContainer={() => containerRef as HTMLElement}
    >
      <div
        style={{
          position: "absolute",
          top: lat,
          left: lng,
          transform: "translate(-50%, -100%)", // Căn giữa & đặt bên dưới điểm
          zIndex: 1000,
        }}
      />
    </Popover>
  );
};

export default PolygonPopup;
