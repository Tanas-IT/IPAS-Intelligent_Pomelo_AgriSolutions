import { Flex } from "antd";
import style from "./User.module.scss";
import { useSidebarStore } from "@/stores";
import { useEffect } from "react";

function User() {
  const { setSidebarState } = useSidebarStore();

  // useEffect(() => {
  //   setSidebarState(false); // Đóng sidebar
  // }, []);

  return (
    <Flex className={style.container}>
      <h1 style={{ width: "100vh" }}>This is User</h1>
    </Flex>
  );
}

export default User;
