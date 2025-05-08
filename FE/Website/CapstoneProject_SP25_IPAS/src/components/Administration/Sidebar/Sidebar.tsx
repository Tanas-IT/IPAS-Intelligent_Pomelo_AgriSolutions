import { Avatar, Divider, Flex, Layout, Menu, Popover, Tooltip, Typography } from "antd";
import style from "./Sidebar.module.scss";
import { Icons, Images } from "@/assets";
import { useEffect, useMemo, useRef, useState } from "react";
import { matchPath, useLocation, useNavigate } from "react-router-dom";
import "@/App.css";
import { PATHS } from "@/routes";
import { useFarmStore, useSidebarStore } from "@/stores";
import { ActiveMenu, MenuItem } from "@/types";
import { useLogout, useResponsive } from "@/hooks";
import { LOCAL_STORAGE_KEYS, MESSAGES, UserRolesStr } from "@/constants";
import { toast } from "react-toastify";
import { authService } from "@/services";
import { getRoleId } from "@/utils";

const { Sider } = Layout;
const { Text } = Typography;

interface SidebarProps {
  isDefault?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isDefault = false }) => {
  useResponsive();
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
  const currentUserRole = getRoleId();

  const { canExpand, isExpanded, toggleSidebar } = useSidebarStore();

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
      to: PATHS.ADMIN.DASHBOARD,
      activePaths: [PATHS.ADMIN.DASHBOARD],
      category: "Main",
      isView: !isDefault,
      roles: [UserRolesStr.Admin],
    },
    {
      key: "User Management",
      label: "User Management",
      icon: <Icons.users />,
      to: PATHS.ADMIN.USER_LIST,
      activePaths: [PATHS.ADMIN.USER_LIST],
      category: "Main",
      isView: !isDefault,
      roles: [UserRolesStr.Admin],
    },
    {
      key: "Farm Management",
      label: "Farm Management",
      icon: <Icons.farms />,
      to: PATHS.ADMIN.FARM_LIST,
      activePaths: [PATHS.ADMIN.FARM_LIST],
      category: "Main",
      isView: !isDefault,
      roles: [UserRolesStr.Admin],
    },
    {
      key: "Payment History",
      label: "Payment History",
      icon: <Icons.addPLan />,
      to: PATHS.ADMIN.PAYMENT_HISTORY,
      activePaths: [PATHS.ADMIN.PAYMENT_HISTORY],
      category: "Main",
      isView: !isDefault,
      roles: [UserRolesStr.Admin],
    },
    {
      key: "Package Management",
      label: "Package Management",
      icon: <Icons.package />,
      activePaths: [PATHS.PACKAGE.PACKAGE_LIST],
      to: PATHS.PACKAGE.PACKAGE_LIST,
      category: "Main",
      isView: !isDefault,
      roles: [UserRolesStr.Admin],
    },
    {
      key: "System Configuration",
      label: "System Configuration",
      icon: <Icons.systemSetting />,
      activePaths: [PATHS.ADMIN.SYSTEM_CONFIG],
      to: PATHS.ADMIN.SYSTEM_CONFIG,
      category: "Main",
      isView: !isDefault,
      roles: [UserRolesStr.Admin],
    },
    {
      key: "My Farms",
      label: "My Farms",
      icon: <Icons.farms />,
      to: PATHS.FARM_PICKER,
      activePaths: [PATHS.FARM_PICKER, PATHS.FARM.CREATE_FARM],
      category: "Main",
      isView: isDefault,
      roles: [UserRolesStr.User],
    },
    {
      key: "Dashboard",
      label: "Dashboard",
      icon: <Icons.dashboard />,
      to: PATHS.EMPLOYEE.DASHBOARD,
      category: "Main",
      activePaths: [PATHS.EMPLOYEE.DASHBOARD],
      isView: !isDefault,
      roles: [UserRolesStr.Employee],
    },
    // {
    //   key: "Farm Information",
    //   label: "Farm Information",
    //   icon: <Icons.farms />,
    //   to: PATHS.FARM.FARM_INFO,
    //   activePaths: [PATHS.FARM.FARM_INFO],
    //   category: "Main",
    //   isView: !isDefault,
    //   roles: [UserRolesStr.Manager, UserRolesStr.Employee],
    // },
    {
      key: "Dashboard",
      label: "Dashboard",
      icon: <Icons.dashboard />,
      to: PATHS.DASHBOARD,
      activePaths: [PATHS.DASHBOARD],
      category: "Main",
      isView: !isDefault,
      roles: [UserRolesStr.Owner, UserRolesStr.Manager],
    },
    {
      key: "Weather",
      label: "Weather",
      icon: <Icons.weather />,
      to: PATHS.WEATHER.WEATHER,
      activePaths: [PATHS.WEATHER.WEATHER],
      category: "Main",
      isView: !isDefault,
      roles: [UserRolesStr.Owner, UserRolesStr.Manager],
    },

    {
      key: "Crop Management",
      label: "Crop Management",
      icon: <Icons.seedling />,
      activePaths: [PATHS.CROP.CROP_LIST, PATHS.CROP.CROP_DETAIL, PATHS.CROP.PLANT_YIELD],
      category: "Main",
      isView: !isDefault,
      roles: [UserRolesStr.Owner, UserRolesStr.Manager],
      subMenuItems: [
        {
          key: "Manage Crop",
          label: "Manage Crop",
          icon: Images.radius,
          to: PATHS.CROP.CROP_LIST,
          activePaths: [PATHS.CROP.CROP_LIST, PATHS.CROP.CROP_DETAIL],
        },
        // {
        //   key: "Manage Harvest Days",
        //   label: "Manage Harvest Days",
        //   icon: Images.radius,
        //   to: PATHS.CROP.HARVEST_DAYS,
        //   activePaths: [PATHS.CROP.HARVEST_DAYS],
        // },
        {
          key: "Plant Yield Performance",
          label: "Plant Yield Performance",
          icon: Images.radius,
          to: PATHS.CROP.PLANT_YIELD,
          activePaths: [PATHS.CROP.PLANT_YIELD],
        },
      ],
    },
    {
      key: "Process Management",
      label: "Process Management",
      icon: <Icons.process />,
      to: PATHS.PROCESS.PROCESS_LIST,
      activePaths: [PATHS.PROCESS.PROCESS_LIST, PATHS.PROCESS.PROCESS_DETAIL],
      category: "Main",
      isView: !isDefault,
      roles: [UserRolesStr.Owner, UserRolesStr.Manager],
    },
    {
      key: "Classification Management",
      label: "Classification Management",
      icon: <Icons.folder />,
      activePaths: [
        PATHS.CLASSIFICATION.GROWTH_STAGE,
        PATHS.CLASSIFICATION.MASTER_TYPE,
        PATHS.CLASSIFICATION.PRODUCT,
        PATHS.CLASSIFICATION.PRODUCT_DETAIL,
        PATHS.CLASSIFICATION.PRODUCT_DETAIL_FROM_CROP,
        PATHS.FARM.CRITERIA_LIST,
      ],
      category: "Main",
      isView: !isDefault,
      roles: [UserRolesStr.Owner, UserRolesStr.Manager],
      subMenuItems: [
        {
          key: "Growth Stage",
          label: "Growth Stage",
          icon: Images.radius,
          to: PATHS.CLASSIFICATION.GROWTH_STAGE,
          activePaths: [PATHS.CLASSIFICATION.GROWTH_STAGE],
        },
        {
          key: "Master Type Management",
          label: "Master Type Management",
          icon: Images.radius,
          to: PATHS.CLASSIFICATION.MASTER_TYPE,
          activePaths: [PATHS.CLASSIFICATION.MASTER_TYPE],
        },
        {
          key: "Manage Product",
          label: "Manage Product",
          icon: Images.radius,
          to: PATHS.CLASSIFICATION.PRODUCT,
          activePaths: [
            PATHS.CLASSIFICATION.PRODUCT,
            PATHS.CLASSIFICATION.PRODUCT_DETAIL,
            PATHS.CLASSIFICATION.PRODUCT_DETAIL_FROM_CROP,
          ],
        },
        {
          key: "Manage Criteria",
          label: "Manage Criteria",
          icon: Images.radius,
          to: PATHS.FARM.CRITERIA_LIST,
          activePaths: [PATHS.FARM.CRITERIA_LIST],
        },
      ],
    },
    {
      key: "Farm Management",
      label: "Farm Management",
      icon: <Icons.farms />,
      activePaths: [
        PATHS.FARM.FARM_INFO,
        PATHS.FARM.FARM_PLOT_LIST,
        PATHS.FARM.FARM_PLOT_CREATE,
        PATHS.FARM.FARM_ROW_LIST,
        PATHS.FARM.FARM_PLANT_LIST,
        PATHS.FARM.FARM_PLANT_DETAIL,
        PATHS.FARM.FARM_PLANT_DETAIL_FROM_ROW,
        PATHS.FARM.FARM_PLANT_LOT_LIST,
        PATHS.FARM.FARM_PLANT_LOT_DETAIL,
        PATHS.FARM.GRAFTED_PLANT_LIST,
        PATHS.FARM.GRAFTED_PLANT_DETAIL,
        PATHS.FARM.CRITERIA_LIST,
      ],
      roles: [UserRolesStr.Owner, UserRolesStr.Manager, UserRolesStr.Employee],
      subMenuItems: [
        {
          key: "Farm Information",
          label: "Farm Information",
          icon: Images.radius,
          to: PATHS.FARM.FARM_INFO,
          activePaths: [PATHS.FARM.FARM_INFO],
        },
        {
          key: "Manage Plots",
          label: "Manage Plots",
          icon: Images.radius,
          to: PATHS.FARM.FARM_PLOT_LIST,
          activePaths: [PATHS.FARM.FARM_PLOT_LIST, PATHS.FARM.FARM_PLOT_CREATE],
        },
        {
          key: "Manage Rows",
          label: "Manage Rows",
          icon: Images.radius,
          to: PATHS.FARM.FARM_ROW_LIST,
          activePaths: [PATHS.FARM.FARM_ROW_LIST, PATHS.FARM.FARM_PLANT_DETAIL_FROM_ROW],
        },
        {
          key: "Manage Plants",
          label: "Manage Plants",
          icon: Images.radius,
          to: PATHS.FARM.FARM_PLANT_LIST,
          activePaths: [PATHS.FARM.FARM_PLANT_LIST, PATHS.FARM.FARM_PLANT_DETAIL],
        },
        {
          key: "Manage Plant Lots",
          label: "Manage Plant Lots",
          icon: Images.radius,
          to: PATHS.FARM.FARM_PLANT_LOT_LIST,
          activePaths: [PATHS.FARM.FARM_PLANT_LOT_LIST, PATHS.FARM.FARM_PLANT_LOT_DETAIL],
          roles: [UserRolesStr.Owner, UserRolesStr.Manager],
        },
        {
          key: "Manage Grafted Plants",
          label: "Manage Grafted Plants",
          icon: Images.radius,
          to: PATHS.FARM.GRAFTED_PLANT_LIST,
          activePaths: [PATHS.FARM.GRAFTED_PLANT_LIST, PATHS.FARM.GRAFTED_PLANT_DETAIL],
        },
      ],
      category: "Main",
      isView: !isDefault,
    },
    {
      key: "Product Management",
      label: "Product Management",
      icon: <Icons.category />,
      category: "Main",
      to: PATHS.CLASSIFICATION.PRODUCT,
      activePaths: [
        PATHS.CLASSIFICATION.PRODUCT,
        PATHS.CLASSIFICATION.PRODUCT_DETAIL,
        PATHS.CLASSIFICATION.PRODUCT_DETAIL_FROM_CROP,
      ],
      isView: !isDefault,
      roles: [UserRolesStr.Employee],
    },
    {
      key: "Work Schedule",
      label: "Work Schedule",
      icon: <Icons.calendar />,
      to: PATHS.EMPLOYEE.WORK_SCHEDULE,
      category: "Main",
      activePaths: [PATHS.EMPLOYEE.WORK_SCHEDULE],
      isView: !isDefault,
      roles: [UserRolesStr.Employee],
    },
    // {
    //   key: "Plants",
    //   label: "Plant Management",
    //   icon: <Icons.plantFill />,
    //   category: "Main",
    //   to: PATHS.FARM.FARM_PLANT_LIST,
    //   activePaths: [
    //     PATHS.FARM.FARM_PLANT_LIST,
    //     PATHS.FARM.FARM_PLANT_DETAIL,
    //     PATHS.FARM.FARM_PLANT_DETAIL_FROM_ROW,
    //   ],
    //   isView: !isDefault,
    //   roles: [UserRolesStr.Employee],
    // },
    // {
    //   key: "GraftedPlants",
    //   label: "Grafted Plant Management",
    //   icon: <Icons.seedling />,
    //   category: "Main",
    //   to: PATHS.FARM.GRAFTED_PLANT_LIST,
    //   activePaths: [PATHS.FARM.GRAFTED_PLANT_LIST, PATHS.FARM.GRAFTED_PLANT_DETAIL],
    //   isView: !isDefault,
    //   roles: [UserRolesStr.Employee],
    // },
    {
      key: "Care Plan Management",
      label: "Care Plan Management",
      icon: <Icons.hand />,
      activePaths: [PATHS.PLAN.PLAN_LIST, PATHS.PLAN.PLAN_DETAIL],
      to: PATHS.PLAN.PLAN_LIST,
      category: "Main",
      isView: !isDefault,
      roles: [UserRolesStr.Owner, UserRolesStr.Manager],
    },
    {
      key: "AI Chatbox",
      label: "AI Chatbox",
      icon: <Icons.robot />,
      to: PATHS.CHATBOX.AI_CHATBOX,
      activePaths: [PATHS.CHATBOX.AI_CHATBOX],
      category: "Main",
      isView: !isDefault,
      roles: [UserRolesStr.Owner, UserRolesStr.Manager, UserRolesStr.Employee],
    },
    {
      key: "Staff Management",
      label: "Staff Management",
      icon: <Icons.people />,
      activePaths: [PATHS.HR.EMPLOYEES, PATHS.HR.WORKLOG_CALENDAR],
      roles: [UserRolesStr.Owner, UserRolesStr.Manager],
      subMenuItems: [
        {
          key: "Manage Employees",
          label: "Manage Employees",
          icon: Images.radius,
          to: PATHS.HR.EMPLOYEES,
          activePaths: [PATHS.HR.EMPLOYEES],
          roles: [UserRolesStr.Owner],
        },
        {
          key: "Work Schedules",
          label: "Work Schedules",
          icon: Images.radius,
          to: PATHS.HR.WORKLOG_CALENDAR,
          activePaths: [PATHS.HR.WORKLOG_CALENDAR, PATHS.HR.WORKLOG_DETAIL],
        },
      ],
      category: "Main",
      isView: !isDefault,
    },
    {
      key: "Partner Management",
      label: "Partner Management",
      icon: <Icons.share />,
      activePaths: [PATHS.PARTNERS.PARTNER_LIST],
      to: PATHS.PARTNERS.PARTNER_LIST,
      category: "Main",
      isView: !isDefault,
      roles: [UserRolesStr.Owner],
    },
    {
      key: "Report Management",
      label: "Report Management",
      icon: <Icons.process />,
      to: PATHS.EXPERT.REPORT_LIST,
      activePaths: [PATHS.EXPERT.REPORT_LIST],
      category: "Main",
      isView: !isDefault,
      roles: [UserRolesStr.Expert],
    },
    {
      key: "Tag Management",
      label: "Tag Management",
      icon: <Icons.tag />, // đổi icon nếu bạn muốn
      to: PATHS.EXPERT.TAG_MANAGEMENT,
      activePaths: [PATHS.EXPERT.TAG_MANAGEMENT],
      category: "Main",
      isView: !isDefault,
      roles: [UserRolesStr.Expert],
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

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Nếu không có roles nghĩa là ai cũng xem được
      if (!item.roles) return true;

      // Nếu có roles, chỉ hiển thị nếu userRole khớp
      return item.roles.includes(currentUserRole);
    });
  }, [menuItems, currentUserRole]);

  menuItems = mergeActivePaths(filteredMenuItems);

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
              height: `${
                (item.subMenuItems!.filter((subItem) => {
                  if (!subItem.roles) return true;
                  return subItem.roles.includes(currentUserRole);
                }).length -
                  1) *
                  48 +
                20
              }px`,
            }}
          />
        )}

        {item
          .subMenuItems!.filter((subItem) => {
            if (!subItem.roles) return true;
            return subItem.roles.includes(currentUserRole);
          })
          .map((subItem) => {
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
              .filter(
                (item) =>
                  item.category === category &&
                  item.isView &&
                  (!item.roles || item.roles.includes(currentUserRole)),
              )
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
        <Flex
          className={`${style.profileWrapper} ${
            !isDefault &&
            currentUserRole !== UserRolesStr.Admin &&
            currentUserRole !== UserRolesStr.Expert &&
            style.cursor
          }`}
        >
          {!isDefault &&
          currentUserRole !== UserRolesStr.Admin &&
          currentUserRole !== UserRolesStr.Expert ? (
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
          ) : (
            <Flex
              className={style.logo}
              style={{
                justifyContent: !isExpanded ? "center" : undefined,
              }}
            >
              <Avatar crossOrigin="anonymous" src={Images.logo} className={style.avatar} />
              {isExpanded && (
                <Text className={style.logoText}>Intelligent Pomelo AgriSolutions</Text>
              )}
            </Flex>
          )}

          {canExpand && (
            <Icons.arrowForward
              className={style.arrowSidebar}
              onClick={toggleSidebar}
              style={{
                transform: `rotate(${isExpanded ? 180 : 0}deg)`,
                color: "#fff",
              }}
            />
          )}
        </Flex>

        {/* Main Menu */}
        {/* <div style={{ height: "66vh" }}>{renderMenuSection("Main")}</div> */}
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
