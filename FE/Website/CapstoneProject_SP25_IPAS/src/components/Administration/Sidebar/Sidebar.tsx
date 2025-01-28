import { Avatar, Divider, Flex, Layout, Menu, Tooltip, Typography } from "antd";
import style from "./Sidebar.module.scss";
import { Icons, Images } from "@/assets";
import { useEffect, useMemo, useRef, useState } from "react";
import { matchPath, useLocation, useNavigate } from "react-router-dom";
import "@/App.css";
import { PATHS } from "@/routes";
import { useSidebarStore } from "@/stores";
import { ActiveMenu, MenuItem } from "@/types";
import { authService } from "@/services";
import { useAuth } from "@/hooks";

const { Sider } = Layout;
const { Text } = Typography;

interface SidebarProps {
  isDefault?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isDefault = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const normalizedPathname = location.pathname.toLowerCase();
  const SIDEBAR_WIDTH_EXPANDED = 280;
  const SIDEBAR_WIDTH_COLLAPSED = 65;
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>({
    parentKey: null,
    subItemKey: null,
  });

  const { isExpanded, toggleSidebar } = useSidebarStore();

  const handleNavigation = (to?: string) => {
    if (to) {
      navigate(to);
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
      key: "My Farms",
      label: "My Farms",
      icon: <Icons.farms />,
      to: PATHS.FARM_PICKER,
      activePaths: [PATHS.FARM_PICKER],
      category: "Main",
      isView: isDefault,
    },
    {
      key: "Dashboard",
      label: "Dashboard",
      icon: <Icons.dashboard />,
      to: PATHS.DASHBOARD,
      activePaths: [PATHS.DASHBOARD],
      category: "Main",
      isView: !isDefault,
    },
    {
      key: "Weather",
      label: "Weather",
      icon: <Icons.weather />,
      to: PATHS.WEATHER.WEATHER,
      activePaths: [PATHS.WEATHER.WEATHER],
      category: "Main",
      isView: !isDefault,
    },
    {
      key: "User Management",
      label: "User Management",
      icon: <Icons.users />,
      to: PATHS.USER.USER_LIST,
      activePaths: [PATHS.USER.USER_LIST, PATHS.USER.USER_DETAIL],
      category: "Main",
      isView: !isDefault,
    },
    {
      key: "Season Management",
      label: "Season Management",
      icon: <Icons.seedling />,
      activePaths: [],
      category: "Main",
      isView: !isDefault,
    },
    {
      key: "Farm Management",
      label: "Farm Management",
      icon: <Icons.farms />,
      activePaths: [""],
      subMenuItems: [
        {
          key: "Farm Information",
          label: "Farm Information",
          icon: Images.radius,
          to: PATHS.FARM.FARM_LIST,
          activePaths: [],
        },
        {
          key: "Manage Plots and Rows",
          label: "Manage Plots and Rows",
          icon: Images.radius,
          to: PATHS.FARM.FARM_LIST,
          activePaths: [],
        },
        {
          key: "Manage Plants",
          label: "Manage Plants",
          icon: Images.radius,
          to: PATHS.FARM.FARM_PLANT_LIST,
          activePaths: [PATHS.FARM.FARM_PLANT_LIST, PATHS.FARM.FARM_PLANT_DETAIL],
        },
        {
          key: "Manage Plant Lot",
          label: "Manage Plant Lot",
          icon: Images.radius,
          to: PATHS.FARM.FARM_PLOT_LIST,
          activePaths: [],
        },
        {
          key: "Manage Criteria",
          label: "Manage Criteria",
          icon: Images.radius,
          to: PATHS.FARM.FARM_PLOT_LIST,
          activePaths: [],
        },
      ],
      category: "Main",
      isView: !isDefault,
    },
    {
      key: "Care Plan Management",
      label: "Care Plan Management",
      icon: <Icons.hand />,
      activePaths: [""],
      category: "Main",
      isView: !isDefault,
    },
    {
      key: "AI Chatbox",
      label: "AI Chatbox",
      icon: <Icons.robot />,
      activePaths: [""],
      category: "Main",
      isView: !isDefault,
    },
    {
      key: "HR Management",
      label: "HR Management",
      icon: <Icons.people />,
      activePaths: [""],
      subMenuItems: [
        {
          key: "Manage Employees",
          label: "Manage Employees",
          icon: Images.radius,
          to: "",
          activePaths: [],
        },
        {
          key: "Work Schedules",
          label: "Work Schedules",
          icon: Images.radius,
          to: "",
          activePaths: [],
        },
      ],
      category: "Main",
      isView: !isDefault,
    },
    {
      key: "Third-Party Management",
      label: "Third-Party Management",
      icon: <Icons.share />,
      activePaths: [""],
      subMenuItems: [
        {
          key: "Manage Suppliers",
          label: "Manage Suppliers",
          icon: Images.radius,
          to: "",
          activePaths: [],
        },
      ],
      category: "Main",
      isView: !isDefault,
    },
    {
      key: "Setting",
      label: "Setting",
      icon: <Icons.setting />,
      activePaths: [""],
      category: "Settings",
      isView: !isDefault,
    },
    {
      key: "Help",
      label: "Help",
      icon: <Icons.help />,
      activePaths: [""],
      category: "Settings",
      isView: !isDefault,
    },
  ];

  const handleLogout = async () => {
    const { getAuthData, clearAuthData } = useAuth();
    const authData = getAuthData();
    if (authData.refreshToken) {
      var result = await authService.logout(authData.refreshToken);
      if (result.statusCode === 200) {
        clearAuthData();
        navigate(PATHS.AUTH.LANDING);
      } else {
        console.log(result.message);
      }
    }
  };

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
        <Flex>
          <Flex
            className={style.logo}
            style={{
              justifyContent: !isExpanded ? "center" : undefined,
            }}
          >
            <Avatar src={isDefault ? Images.logo : Images.react} className={style.avatar} />
            {isExpanded && (
              <Text className={style.logoText}>
                {isDefault ? "Intelligent Pomelo AgriSolutions" : "Tan Trieu Pomelo"}
              </Text>
            )}
          </Flex>
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

export default Sidebar;
