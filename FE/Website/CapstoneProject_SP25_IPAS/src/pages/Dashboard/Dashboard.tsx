import { Col, Flex, Row } from "antd";
import style from "./Dashboard.module.scss";
import StatBox from "./components/StatBox/StatBox";
import { Icons } from "@/assets";
import WeatherCard from "./components/WeatherCard/WeatherCard";

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
    title: "Land Plots",
    subtitle: "50",
    icon: <Icons.plot style={{ fontSize: 24, color: "#722ed1" }} />,
    progress: 0.7,
    increase: "+2",
  },
];

const weatherData = {
  currentTemp: 29.04,
  tempMax: 29.04,
  tempMin: 29.04,
  status: "Clouds",
  description: "broken clouds",
  humidity: 51,
  visibility: 10000,
  windSpeed: "2.02 m/s",
  clouds: 55
};

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
        <WeatherCard weather={weatherData} />
      </Flex>
    </Flex>
  );
}

export default Dashboard;
