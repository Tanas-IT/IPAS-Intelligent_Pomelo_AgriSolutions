import { Col, Flex, Row } from "antd";
import style from "./Dashboard.module.scss";
import StatBox from "./components/StatBox/StatBox";
import { Icons } from "@/assets";

const statsData = [
  {
    title: "Plants",
    subtitle: "1,250",
    icon: <Icons.plantFill style={{ fontSize: 24, color: "#52c41a" }} />,
    progress: 0.75,
    increase: "+5%",
  },
  {
    title: "Users",
    subtitle: "340",
    icon: <Icons.users style={{ fontSize: 24, color: "#1890ff" }} />,
    progress: 0.6,
    increase: "+2%",
  },
  {
    title: "Active Plans",
    subtitle: "15",
    icon: <Icons.plan style={{ fontSize: 24, color: "#faad14" }} />,
    progress: 0.9,
    increase: "+10%",
  },
  {
    title: "Plant Lots",
    subtitle: "32",
    icon: <Icons.addPLan style={{ fontSize: 24, color: "#eb2f96" }} />,
    progress: 0.8,
    increase: "+3",
  },
  {
    title: "Land Plots",
    subtitle: "50",
    icon: <Icons.plot style={{ fontSize: 24, color: "#722ed1" }} />,
    progress: 0.7,
    increase: "+2",
  },
];

function Dashboard() {
  return (
    <Flex className={style.container}>
      <Flex gap={20}>
        {statsData.map((stat, index) => (
          <Flex key={index}>
            <StatBox
              title={stat.title}
              subtitle={stat.subtitle}
              icon={stat.icon}
              // progress={stat.progress}
              increase={stat.increase}
            />
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
}

export default Dashboard;
