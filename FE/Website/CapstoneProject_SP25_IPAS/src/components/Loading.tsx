import { Flex, Spin } from "antd";
import React from "react";

const Loading: React.FC = () => {
  return (
    <Flex style={{ justifyContent: "center", alignContent: "center" }}>
      <Spin
        style={{ height: "100vh", justifyContent: "center", alignContent: "center" }}
        size="large"
      />
    </Flex>
  );
};

export default Loading;
