import { Avatar, Divider, Flex, Layout, Menu, Popover, Tooltip, Typography } from "antd";
import style from "./SidebarEmployee.module.scss";
import { Icons, Images } from "@/assets";
import { useEffect, useMemo, useRef, useState } from "react";
import { matchPath, useLocation, useNavigate } from "react-router-dom";
import "@/App.css";
import { PATHS } from "@/routes";
import { useFarmStore, useSidebarStore } from "@/stores";
import { ActiveMenu, MenuItem } from "@/types";
import { useLogout } from "@/hooks";
import { LOCAL_STORAGE_KEYS, MESSAGES } from "@/constants";
import { toast } from "react-toastify";
import { authService } from "@/services";

const { Sider } = Layout;
const { Text } = Typography;

interface SidebarProps {
  isDefault?: boolean;
}

const SidebarEmployee: React.FC<SidebarProps> = ({ isDefault = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const normalizedPathname = location.pathname.toLowerCase();
  const SIDEBAR_WIDTH_EXPANDED = 280;
  const SIDEBAR_WIDTH_COLLAPSED = 65;
  const { farmName, farmLogo } = useFarmStore();
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>({
    parentKey: null,
    subItemKey: null,
  });

  const { isExpanded, toggleSidebar } = useSidebarStore();

  const handleNavigation = (to?: string) => {
    if (to) {
      navigate(to.startsWith("/") ? to : `/${to}`);
    }
  };

  const mergeActivePaths = (menuItems: MenuItem[]): MenuItem[] => {
    return menuItems.map((item) => {
      if (item.subMenuItems) {
        // Gộp activePaths của tất cả các subMenuItems
        const subMenuActivePaths = item.subMenuItems.flatMap((subItem) => subItem.activePaths);

        // Loại bỏ trùng lặp và gộp thêm activePaths độc lập của mục cha
        item.activePaths = Array.from(new Set([...item.activePaths, ...subMenuActivePaths]));
      }
      return item;
    });
  };

  let menuItems: MenuItem[] = [
    {
      key: "Dashboard",
      label: "Dashboard",
      icon: <Icons.dashboard />,
      to: PATHS.EMPLOYEE.DASHBOARD,
      category: "Main",
      activePaths: [PATHS.EMPLOYEE.DASHBOARD],
      isView: !isDefault
    },
    {
      key: "Work Schedule",
      label: "Lịch công việc",
      icon: <Icons.calendar />,
      to: PATHS.EMPLOYEE.WORK_SCHEDULE,
      category: "Main",
      activePaths: [PATHS.EMPLOYEE.WORK_SCHEDULE],
      isView: !isDefault
    },
    {
      key: "Worklog",
      label: "Nhật ký công việc",
      icon: <Icons.history />,
      to: PATHS.EMPLOYEE.WORKLOG,
      category: "Main",
      activePaths: [PATHS.EMPLOYEE.WORKLOG],
      isView: !isDefault
    },
    {
      key: "Plants",
      label: "Plant Management",
      icon: <Icons.plantFill />,
      to: PATHS.EMPLOYEE.PLANTS,
      category: "Main",
      activePaths: [PATHS.EMPLOYEE.PLANTS],
      isView: !isDefault
    },
    {
      key: "AI",
      label: "AI Consulting",
      icon: <Icons.robot />,
      to: PATHS.EMPLOYEE.AI_CONSULTING,
      category: "Main",
      activePaths: [PATHS.EMPLOYEE.AI_CONSULTING],
      isView: !isDefault
    },
  ];

  const handleBack = async () => {
    const result = await authService.refreshTokenOutFarm();
    if (result.statusCode === 200) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, result.data.authenModel.accessToken);
      localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, result.data.authenModel.refreshToken);
      navigate(PATHS.FARM_PICKER);
    } else {
      toast.error(MESSAGES.ERROR_OCCURRED);
    }
  };

  const handleLogout = useLogout();

  menuItems = mergeActivePaths(menuItems);

  const findMatchingPath = (paths: string[], pathname: string) => {
    return paths.some((path) => {
      if (path.includes(":id")) {
        return matchPath(path, pathname);
      }
      return pathname === path;
    });
  };

  const findCurrentItem = (menuItems: MenuItem[], pathname: string) => {
    return menuItems.find(
      (menuItem) =>
        (menuItem.activePaths && findMatchingPath(menuItem.activePaths, pathname)) ||
        pathname === menuItem.to,
    );
  };

  const currentItem = useMemo(
    () => findCurrentItem(menuItems, normalizedPathname),
    [menuItems, normalizedPathname],
  );

  useEffect(() => {
    if (currentItem) {
      let matchingSubMenu = null;

      // Tìm submenu item phù hợp
      matchingSubMenu =
        currentItem.subMenuItems?.find((subItem) =>
          subItem.activePaths.some((path) => normalizedPathname === path),
        ) ||
        currentItem.subMenuItems?.find((subItem) =>
          findMatchingPath(subItem.activePaths, normalizedPathname),
        );

      setActiveMenu({
        parentKey: currentItem.key || null,
        subItemKey: matchingSubMenu ? matchingSubMenu.key : null,
      });
    }
  }, [normalizedPathname]);

  const defaultOpenKeys = useMemo(
    () => (currentItem?.key ? [currentItem.key] : undefined),
    [currentItem],
  );

  const defaultKey = menuItems
    .map((item) => {
      // Kiểm tra nếu mục chính không có submenu và normalizedPathname có trong activePaths của item
      if (item.activePaths && !item.subMenuItems && item.activePaths.includes(normalizedPathname)) {
        return item.key; // Trả về key của mục chính
      }

      // Kiểm tra nếu mục chính có submenu và normalizedPathname có trong activePaths của subMenuItems
      if (item.subMenuItems) {
        const matchingSubItem = item.subMenuItems.find((subItem) =>
          subItem.activePaths.includes(normalizedPathname),
        );
        if (matchingSubItem) {
          return matchingSubItem.key; // Trả về key của subItem
        }
      }

      return null; // Nếu không khớp, trả về null
    })
    .find((key) => key !== null);

  const renderMenuItem = (item: MenuItem) => {
    const isMainMenuActive = item.key === activeMenu.parentKey;
    // const getIconClassName = (isMainMenuActive: boolean) => {
    //   return `${style.menuIcon} ${!isMainMenuActive ? style.iconInActive : ""}`;
    // };

    if (!item.subMenuItems) {
      return (
        <Menu.Item
          key={item.key}
          icon={<Flex className={style.menuIcon}>{item.icon}</Flex>}
          className={`${style.menuItem} ${isMainMenuActive ? style.active : ""}`}
          onClick={() => handleNavigation(item.to)}
          data-menu-key={item.key}
        >
          {item.label}
        </Menu.Item>
      );
    }
    return (
      <Menu.SubMenu
        key={item.key}
        className={`subMenuItems ${isMainMenuActive ? "active" : ""}`}
        icon={<Flex className={style.menuIcon}>{item.icon}</Flex>}
        title={isExpanded ? <span className={style.subMenuItemsTitle}>{item.label}</span> : null}
      >
        {isExpanded && (
          <div
            className={style.subMenuLine}
            style={{
              height: `${(item.subMenuItems!.length - 1) * 48 + 20}px`,
            }}
          />
        )}

        {item.subMenuItems!.map((subItem) => {
          const isSubItemActive = subItem.key === activeMenu.subItemKey;
          return isExpanded ? (
            <Flex key={subItem.key} className={style.subMenuItem}>
              <img style={{ width: "24px" }} src={subItem.icon} alt={subItem.label} />
              <Flex
                className={`${style.item} ${isSubItemActive ? style.active : ""}`}
                onClick={() => handleNavigation(subItem.to)}
                data-menu-key={subItem.key}
              >
                {subItem.label}
              </Flex>
            </Flex>
          ) : (
            <Menu.Item
              key={subItem.key}
              className={`${style.menuItem} ${isSubItemActive ? style.active : ""}`}
              onClick={() => handleNavigation(subItem.to)}
            >
              {subItem.label}
            </Menu.Item>
          );
        })}
      </Menu.SubMenu>
    );
  };

  const renderMenuSection = (category: string) => {
    const sidebarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (sidebarRef.current && defaultKey) {
        const activeItem = sidebarRef.current.querySelector(`[data-menu-key='${defaultKey}']`);

        if (activeItem) {
          activeItem.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
        }
      }
    }, []);

    return (
      <Flex
        className={`${style.menuContainer} ${category === "Settings" ? style.menuMinHeight : ""}`}
        ref={sidebarRef}
      >
        <Flex className={style.wrapperTitle}>
          <Text className={style.title}>{category}</Text>
        </Flex>
        <Flex className={category === "Settings" ? style.menuOverflowHidden : ""}>
          <Menu mode="inline" defaultOpenKeys={defaultOpenKeys} className={style.menuItems}>
            {menuItems
              .filter((item) => item.category === category && item.isView)
              .map((item) => renderMenuItem(item))}
          </Menu>
        </Flex>
      </Flex>
    );
  };

  const profileContent = (
    <Flex className={style.popupContainer}>
      <Flex className={style.popupNav}>
        <Flex className={style.popupSubNav} onClick={handleBack}>
          <Text>Back to Farm Picker</Text>
        </Flex>
      </Flex>
    </Flex>
  );

  return (
    <Sider
      width={isExpanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED}
      collapsible
      collapsed={!isExpanded}
      trigger={null}
      className={style.sidebarWrapper}
    >
      <Flex className={style.sidebar}>
        {/* Header */}
        <Flex className={`${style.profileWrapper} ${!isDefault && style.cursor}`}>
          {!isDefault && (
            <Popover content={profileContent} trigger="click" placement="bottom" color="#f0f0f0">
              <Flex
                className={style.logo}
                style={{
                  justifyContent: !isExpanded ? "center" : undefined,
                }}
              >
                <Avatar crossOrigin="anonymous" src={farmLogo} className={style.avatar} />
                {isExpanded && <Text className={style.logoText}>{farmName}</Text>}
                <Icons.arrowDropDownLine className={style.dropdownIcon} />
              </Flex>
            </Popover>
          )}
          {isDefault && (
            <Flex
              className={style.logo}
              style={{
                justifyContent: !isExpanded ? "center" : undefined,
              }}
            >
              <Avatar crossOrigin="anonymous" src={Images.logo} className={style.avatar} />
              {isExpanded && (
                <Text className={style.logoText}>{"Intelligent Pomelo AgriSolutions"}</Text>
              )}
            </Flex>
          )}

          <Icons.arrowForward
            className={style.arrowSidebar}
            onClick={toggleSidebar}
            style={{
              transform: `rotate(${isExpanded ? 180 : 0}deg)`,
              color: "#fff",
            }}
          />
        </Flex>

        {/* Main Menu */}
        {renderMenuSection("Main")}

        {!isDefault && (
          <>
            <Flex className={style.wrapperDivider}>
              <Divider className={style.divider} />
            </Flex>
            {renderMenuSection("Settings")}
          </>
        )}

        <Flex
          className={style.profile}
          style={{
            justifyContent: !isExpanded ? "center" : undefined,
          }}
          onClick={handleLogout}
        >
          <Tooltip title={!isExpanded ? "Logout Account" : ""} placement="right">
            <Icons.logout className={style.logoutIcon} />
          </Tooltip>
          {isExpanded && <Text className={style.logoutText}>Logout Account</Text>}
        </Flex>
      </Flex>
    </Sider>
  );
};

export default SidebarEmployee;
