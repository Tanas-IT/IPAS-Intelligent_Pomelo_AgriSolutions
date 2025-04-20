import React, { ReactNode, useEffect, useState } from "react";

import style from "./FarmPickerLayout.module.scss";
import { Flex, Layout } from "antd";
import { Footer, HeaderAdmin, Loading, SidebarAdmin } from "@/components";
import { useRequireAuth, useToastFromLocalStorage, useToastMessage } from "@/hooks";
import { UserRole } from "@/constants";
import { getRoleId } from "@/utils";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes";
const { Content } = Layout;

interface FarmPickerLayoutProps {
  children: ReactNode;
  hideSidebar?: boolean;
}

const FarmPickerLayout: React.FC<FarmPickerLayoutProps> = ({ children, hideSidebar }) => {
  const navigate = useNavigate();
  useToastFromLocalStorage();
  useToastMessage();
  const isTokenChecked = useRequireAuth();
  const [isUser, setIsUser] = useState<boolean>(true);

  useEffect(() => {
    const roleId = getRoleId();
    if (roleId !== UserRole.User.toString()) {
      setIsUser(false);
      navigate(PATHS.DASHBOARD);
    }
  }, [navigate]);

  if (!isTokenChecked || !isUser) return <Loading />;

  return (
    <Flex>
      {!hideSidebar && <SidebarAdmin isDefault={true} />}
      <Layout className={style.layout}>
        <HeaderAdmin isDefault={true} />
        <Content className={style.contentWrapper}>
          <Flex className={style.content}>{children}</Flex>
        </Content>
        <div className={style.footerWrapper}>
          <Footer isManagement={true} />
        </div>
      </Layout>
    </Flex>
  );
};

export default FarmPickerLayout;
