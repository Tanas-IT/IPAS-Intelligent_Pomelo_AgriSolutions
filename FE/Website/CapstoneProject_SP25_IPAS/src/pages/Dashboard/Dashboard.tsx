// import { Col, Flex, Row } from "antd";
// import style from "./Dashboard.module.scss";
// import StatBox from "./components/StatBox/StatBox";
// import { Icons } from "@/assets";
// import WeatherCard from "./components/WeatherCard/WeatherCard";
// import { useEffect, useState } from "react";
// import { dashboardService } from "@/services";
// import { getFarmId } from "@/utils";
// import { DashboardResponses } from "@/payloads/dashboard";
// import PlantDevelopmentChart from "./components/PlantDevelopmentChart/PlantDevelopmentChart";
// import PlantDevelopmentStages from "./components/PlantDevelopmentStages/PlantDevelopmentStages";
// import PlantHealthStatus from "./components/PlantHealthStatus/PlantHealthStatus";
// import SynchronizedAreaChart from "./components/SynchronizedAreaChart/SynchronizedAreaChart";
// import { useFarmStore } from "@/stores";
// import ExpiredPackageModal from "./ExpiredPackageModal";
// import MaterialChart from "./components/MaterialChart/MaterialChart";

// const statsData = [
//   {
//     title: "Plants",
//     subtitle: "1,250",
//     icon: <Icons.plantFill style={{ fontSize: 24, color: "#52c41a" }} />,
//     progress: 0.75,
//     increase: "+5%",
//   },
//   {
//     title: "Users",
//     subtitle: "340",
//     icon: <Icons.users style={{ fontSize: 24, color: "#1890ff" }} />,
//     progress: 0.6,
//     increase: "+2%",
//   },
//   {
//     title: "Active Plans",
//     subtitle: "15",
//     icon: <Icons.plan style={{ fontSize: 24, color: "#faad14" }} />,
//     progress: 0.9,
//     increase: "+10%",
//   },
//   {
//     title: "Land Plots",
//     subtitle: "50",
//     icon: <Icons.plot style={{ fontSize: 24, color: "#722ed1" }} />,
//     progress: 0.7,
//     increase: "+2",
//   },
// ];

// const weatherData = {
//   currentTemp: 29.04,
//   tempMax: 29.04,
//   tempMin: 29.04,
//   status: "Clouds",
//   description: "broken clouds",
//   humidity: 51,
//   visibility: 10000,
//   windSpeed: "2.02 m/s",
//   clouds: 55
// };

// function Dashboard() {
//   const [data, setData] = useState<DashboardResponses>();
//   const { farmExpiredDate } = useFarmStore();
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   useEffect(() => {
//     const fetchDashboard = async () => {
//       try {
//         const res = await dashboardService.getDashboardData();
//         console.log("db", res);

//         setData(res);
//       } catch (error) {
//         console.error("error", error);
//       }
//     };

//     fetchDashboard();
//   }, []);

//   useEffect(() => {
//     console.log(farmExpiredDate);

//     if (farmExpiredDate && new Date(farmExpiredDate).getTime() < Date.now()) {
//       setIsModalVisible(true);
//     }
//   }, [farmExpiredDate]);
//   return (
//     <>
//       <Flex className={style.container}>
//         <Flex gap={20}>
//           {statsData.map((stat, index) => (
//             <Flex key={index}>
//               <StatBox
//                 title={stat.title}
//                 subtitle={stat.subtitle}
//                 icon={stat.icon}
//                 // progress={stat.progress}
//                 increase={stat.increase}
//               />
//             </Flex>
//           ))}
//           <WeatherCard weather={weatherData} />
//         </Flex>
//         <Flex gap={20} className={style.chartContainer}>
//           <Col span={8} className={style.pieChart}>
//             <h3>Plant Development Distribution</h3>
//             <PlantDevelopmentChart data={data?.plantDevelopmentDistribution || {}} />
//           </Col>
//           <Col span={8} className={style.pieChart}>
//             <PlantDevelopmentStages data={data?.plantDevelopmentStages || {}} />;
//           </Col>
//           <Col span={8} className={style.pieChart}>
//             <PlantHealthStatus data={data?.plantHealthStatus || {}} />;
//           </Col>
//         </Flex>
//         <Flex gap={20} className={style.chartContainer}>
//           <Col span={12} className={style.pieChart}>
//             <MaterialChart />
//           </Col>
//           <Col span={12} className={style.pieChart}>
//             <PlantDevelopmentStages data={data?.plantDevelopmentStages || {}} />;
//           </Col>
//         </Flex>
//       </Flex>
//       {isModalVisible && <ExpiredPackageModal />}
//     </>
//   );
// }

// export default Dashboard;
import { Col, Flex, Segmented } from "antd";
import style from "./Dashboard.module.scss"; // Import SCSS
import StatBox from "./components/StatBox/StatBox";
import { Icons } from "@/assets";
import WeatherCard from "./components/WeatherCard/WeatherCard";
import { useEffect, useState } from "react";
import { dashboardService } from "@/services";
import { DashboardResponses } from "@/payloads/dashboard";
import PlantDevelopmentChart from "./components/PlantDevelopmentChart/PlantDevelopmentChart";
import PlantDevelopmentStages from "./components/PlantDevelopmentStages/PlantDevelopmentStages";
import PlantHealthStatus from "./components/PlantHealthStatus/PlantHealthStatus";
import MaterialChart from "./components/MaterialChart/MaterialChart";
import { useFarmStore } from "@/stores";
import ExpiredPackageModal from "./ExpiredPackageModal";
import classNames from "classnames"; // Để kết hợp class
import ProductivityByPlot from "./components/ProductivityByPlot/ProductivityByPlot";

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
  clouds: 55,
};

function Dashboard() {
  const [data, setData] = useState<DashboardResponses>();
  const { farmExpiredDate } = useFarmStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("Plant"); // Tab mặc định

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardService.getDashboardData();
        console.log("db", res);
        setData(res);
      } catch (error) {
        console.error("error", error);
      }
    };

    fetchDashboard();
  }, []);

  useEffect(() => {
    console.log(farmExpiredDate);
    if (farmExpiredDate && new Date(farmExpiredDate).getTime() < Date.now()) {
      setIsModalVisible(true);
    }
  }, [farmExpiredDate]);

  // Hàm render nội dung từng tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "Plant":
        return (
          <Flex gap={20} className={style.chartContainer} vertical>
            <Flex gap={20} style={{padding: 20}}>
            <Col span={8} className={style.pieChart}>
              <h3>Plant Development Distribution</h3>
              <PlantDevelopmentChart data={data?.plantDevelopmentDistribution || {}} />
            </Col>
            <Col span={8} className={style.pieChart}>
              <h3>Plant Development Stages</h3>
              <PlantDevelopmentStages data={data?.plantDevelopmentStages || {}} />
            </Col>
            <Col span={8} className={style.pieChart}>
              <h3>Plant Health Status</h3>
              <PlantHealthStatus data={data?.plantHealthStatus || {}} />
            </Col>
            </Flex>
            <Flex>
            <Col span={24} className={style.pieChart}>
              <h3>Productivity by Plot</h3>
              <ProductivityByPlot data={data?.productivityByPlots || []} />
            </Col>
            </Flex>
          </Flex>
        );
      case "Harvest":
        return (
          <Flex gap={20} className={style.chartContainer}>
            <Col span={12} className={style.pieChart}>
              <h3>Materials in Store</h3>
              <MaterialChart />
            </Col>
            <Col span={12} className={style.pieChart}>
              <h3>Seasonal Yield</h3>
              <div>Coming soon...</div>
            </Col>
            <Col span={12} className={style.pieChart}>
              <h3>Pomelo Quality Breakdown</h3>
              <div>Coming soon...</div>
            </Col>
          </Flex>
        );
      case "Plan":
        return (
          <Flex gap={20} className={style.chartContainer}>
            <Col span={12} className={style.pieChart}>
              <h3>Tổng Plan Theo Tháng/Năm</h3>
              <div>Coming soon...</div>
            </Col>
            <Col span={12} className={style.pieChart}>
              <h3>Tỷ Lệ Plan Theo Trạng Thái</h3>
              <div>Coming soon...</div>
            </Col>
            <Col span={12} className={style.pieChart}>
              <h3>Số Plan Theo Loại Công Việc</h3>
              <div>Coming soon...</div>
            </Col>
          </Flex>
        );
      case "Employee":
        return (
          <Flex gap={20} className={style.chartContainer}>
            <Col span={24} className={style.pieChart}>
              <h3>Tổng Quan Employee</h3>
              <div>Table coming soon...</div>
            </Col>
            <Col span={24} className={style.pieChart}>
              <h3>So Sánh Employee</h3>
              <div>Multi-select coming soon...</div>
            </Col>
          </Flex>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Flex className={style.container}>
        {/* Stats và Weather */}
        <Flex gap={20} className={style.statBoxContainer}>
          {statsData.map((stat, index) => (
            <Flex key={index}>
              <StatBox
                title={stat.title}
                subtitle={stat.subtitle}
                icon={stat.icon}
                increase={stat.increase}
              />
            </Flex>
          ))}
          <WeatherCard weather={weatherData} />
        </Flex>

        {/* Segmented và nội dung tab */}
        <Flex vertical gap={20} style={{ width: "100%" }}>
          <Segmented
            options={["Plant", "Harvest", "Plan", "Employee"]}
            value={activeTab}
            onChange={(value) => setActiveTab(value as string)}
            block
            className={style.segmented} // Thêm class nếu cần style riêng
          />
          {renderTabContent()}
        </Flex>
      </Flex>
      {isModalVisible && <ExpiredPackageModal />}
    </>
  );
}

export default Dashboard;