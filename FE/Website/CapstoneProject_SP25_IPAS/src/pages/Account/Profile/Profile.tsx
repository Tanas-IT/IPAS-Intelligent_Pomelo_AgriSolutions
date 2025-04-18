import { Tabs, Flex } from "antd";
import style from "./Profile.module.scss";
import ProfileInfo from "./ProfileInfo/ProfileInfo";

const sidebarProfileTitle = ["Profile Information", "Security Settings"];

function Profile() {
  return (
    <Flex className={style.profileContainer}>
      <Tabs
        defaultActiveKey="0"
        tabPosition="left"
        className={`${style.tabsContainer}`}
        tabBarStyle={{
          minWidth: 200,
          backgroundColor: "#fff",
          paddingTop: "20px",
        }}
        items={sidebarProfileTitle.map((title, index) => ({
          key: String(index),
          label: <span className={style.tab}>{title}</span>,
          children: (
            <>
              {index === 0 && <ProfileInfo />}
              {/* {index === 1 && <SecuritySettings locationString={locationString} flag={flag} />}
              {index === 2 && <Billing subscription={subscription} />} */}
            </>
          ),
        }))}
      />
    </Flex>
  );
}

export default Profile;
