import React from "react";
import { Image } from "antd";

interface ImageCustomProps {
  src: string;
  maxWidth?: number | string;
  height?: number;
  alt?: string;
}

const ImageCustom: React.FC<ImageCustomProps> = ({
  src,
  maxWidth = 120,
  height = 120,
  alt = "attachment",
}) => {
  return (
    <Image
      src={src}
      alt={alt}
      width="100%"
      height={height}
      style={{ borderRadius: "5px", maxWidth }}
      crossOrigin="anonymous"
    />
  );
};

export default ImageCustom;
