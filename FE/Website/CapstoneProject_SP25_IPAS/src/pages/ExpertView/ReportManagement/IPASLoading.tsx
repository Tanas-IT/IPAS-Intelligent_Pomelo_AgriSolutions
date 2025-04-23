import React from "react";
import { Flex, Spin, Typography } from "antd";
import style from "./IPASLoading.module.scss";

const { Text } = Typography;

interface IPASLoadingProps {
  message?: string;
}

const IPASLoading: React.FC<IPASLoadingProps> = ({
  message = "Loading IPAS... Hang tight!",
}) => {
  return (
    <Flex
      vertical
      align="center"
      justify="center"
      className={style.ipasLoading}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.7)",
        zIndex: 1000,
      }}
    >
      <div className={style.textAnimation}>
        {["I", "P", "A", "S"].map((letter, index) => (
          <span
            key={index}
            className={style.letter}
            style={{ animationDelay: `${index * 0.3}s` }}
          >
            {letter}
          </span>
        ))}
      </div>
      <Spin size="large" />
      <Text
        style={{
          color: "#fff",
          fontSize: 18,
          fontWeight: 500,
          marginTop: 16,
          textShadow: "0 2px 4px rgba(0,0,0,0.3)",
        }}
      >
        {message}
      </Text>
    </Flex>
  );
};

export default IPASLoading;