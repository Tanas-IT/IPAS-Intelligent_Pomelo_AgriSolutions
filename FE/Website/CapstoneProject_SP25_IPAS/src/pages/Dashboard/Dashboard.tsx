import { Col, Flex, Segmented } from "antd";
import style from "./Dashboard.module.scss";
import StatBox from "./components/StatBox/StatBox";
import { Icons } from "@/assets";
import WeatherCard from "./components/WeatherCard/WeatherCard";
import { useEffect, useState } from "react";
import { dashboardService } from "@/services";
import {
  CompareWorkPerformanceResponse,
  DashboardResponses,
  StatisticPlanData,
} from "@/payloads/dashboard";
import PlantDevelopmentChart from "./components/PlantDevelopmentChart/PlantDevelopmentChart";
import PlantDevelopmentStages from "./components/PlantDevelopmentStages/PlantDevelopmentStages";
import PlantHealthStatus from "./components/PlantHealthStatus/PlantHealthStatus";
import MaterialChart from "./components/MaterialChart/MaterialChart";
import ProductivityByPlot from "./components/ProductivityByPlot/ProductivityByPlot";
import SeasonalYieldChart from "./components/SeasonalYieldChart/SeasonalYieldChart";
import PomeloQualityBreakdown from "./components/PomeloQualityBreakdown/PomeloQualityBreakdown";
import PlanOverview from "./components/PlanOverview/PlanOverview";
import PlansByMonthChart from "./components/PlansByMonthChart/PlansByMonthChart";
import StatusDistributionChart from "./components/StatusDistributionChart/StatusDistributionChart";
import PlansByWorkTypeChart from "./components/PlansByWorkTypeChart/PlansByWorkTypeChart";
import { useFarmStore } from "@/stores";
import ExpiredPackageModal from "./ExpiredPackageModal";
import EmployeeOverview from "./components/EmployeeOverview/EmployeeOverview";
import CompareWorkPerformance from "./components/CompareWorkPerformance/CompareWorkPerformance";
import { Loading } from "@/components";

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
  const [planData, setPlanData] = useState<StatisticPlanData>();
  const [compareData, setCompareData] = useState<CompareWorkPerformanceResponse>();
  const { farmExpiredDate } = useFarmStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("Plant");
  const [loading, setLoading] = useState({
    plant: true,
    harvest: true,
    plan: true,
    // employee: true,
  });

  const fetchDashboard = async () => {
    try {
      setLoading((prev) => ({ ...prev, plant: true, harvest: true }));
      const res = await dashboardService.getDashboardData();
      setData(res);
    } catch (error) {
      console.error("error", error);
    } finally {
      setLoading((prev) => ({ ...prev, plant: false, harvest: false }));
    }
  };

  const fetchPlanDashboard = async () => {
    try {
      setLoading((prev) => ({ ...prev, plan: true }));
      const res = await dashboardService.getStatisticPlan(2025);
      setPlanData(res);
    } catch (error) {
      console.error("error", error);
    } finally {
      setLoading((prev) => ({ ...prev, plan: false }));
    }
  };

  const handleCompare = async (employeeIds: number[]) => {
    try {
      setLoading((prev) => ({ ...prev, employee: true }));
      const res = await dashboardService.compareWorkPerformance(employeeIds);
      setCompareData(res);
    } catch (error) {
      console.error("Error comparing work performance:", error);
    } finally {
      setLoading((prev) => ({ ...prev, employee: false }));
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchPlanDashboard();
  }, []);

  const statsData = [
    {
      title: "Plants",
      subtitle: data?.totalPlant?.toString() || "0",
      icon: <Icons.plantFill style={{ fontSize: 24, color: "#52c41a" }} />,
    },
    {
      title: "Employees",
      subtitle: data?.totalEmployee?.toString() || "0",
      icon: <Icons.users style={{ fontSize: 24, color: "#1890ff" }} />,
      progress: 0.6,
    },
    {
      title: "Active Tasks",
      subtitle: data?.totalTask?.toString() || "0",
      icon: <Icons.plan style={{ fontSize: 24, color: "#faad14" }} />,
    },
    {
      title: "Completed Tasks",
      subtitle: `${data?.taskComplete || 0}%`,
      icon: <Icons.checkCircle style={{ fontSize: 24, color: "#722ed1" }} />,
      progress: (data?.taskStatusDistribution?.taskStatus?.["Completed"] || 0) / 100,
    },
  ];

  useEffect(() => {
    console.log(farmExpiredDate);
    if (farmExpiredDate && new Date(farmExpiredDate).getTime() < Date.now()) {
      setIsModalVisible(true);
    }
  }, [farmExpiredDate]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "Plant":
        return loading.plant ? (
          <Loading />
        ) : (
          <Flex gap={20} className={style.chartContainer} vertical>
            <div className={style.threeChartGrid}>
              <div className={style.pieChart}>
                <h3>Plant Development Distribution</h3>
                <PlantDevelopmentChart data={data?.plantDevelopmentDistribution || {}} />
              </div>
              <div className={style.pieChart}>
                <h3>Plant Development Stages</h3>
                <PlantDevelopmentStages data={data?.plantDevelopmentStages || {}} />
              </div>
              <div className={style.pieChart}>
                <h3>Plant Health Status</h3>
                <PlantHealthStatus data={data?.plantHealthStatus || {}} />
              </div>
            </div>
            <Flex>
              <Col span={24} className={style.pieChart}>
                <ProductivityByPlot />
              </Col>
            </Flex>
          </Flex>
        );
      case "Harvest":
        return loading.harvest ? (
          <Loading />
        ) : (
          <Flex vertical gap={20}>
            <Flex vertical={false} gap={20}>
              <Col span={12} className={style.pieChart}>
                <MaterialChart />
              </Col>
              <Col span={12} className={style.pieChart}>
                <SeasonalYieldChart />
              </Col>
            </Flex>
            <Flex className={style.pomeloQualityBreakdown} gap={100}>
              <Flex vertical>
                <h3 style={{ whiteSpace: "nowrap" }}>Pomelo Quality Breakdown</h3>
                <p style={{ color: "gray", width: "200px", marginTop: "20px" }}>
                  This section provides a detailed breakdown of pomelo quality across different
                  harvest seasons for the selected year.
                </p>
              </Flex>
              <PomeloQualityBreakdown />
            </Flex>
          </Flex>
        );
      case "Plan":
        return loading.plan ? (
          <Loading />
        ) : (
          <Flex gap={20} className={style.chartContainer} vertical>
            {planData ? (
              <>
                <Col span={24} className={style.pieChart}>
                  <h3>Plan Overview</h3>
                  <PlanOverview data={planData} />
                </Col>
                <Flex gap={20}>
                  <Col span={12} className={style.pieChart}>
                    <PlansByMonthChart />
                  </Col>
                  <Col span={12} className={style.pieChart}>
                    <StatusDistributionChart />
                  </Col>
                </Flex>
                <Col span={24} className={style.pieChart}>
                  <PlansByWorkTypeChart />
                </Col>
              </>
            ) : (
              <div>No plan data available</div>
            )}
          </Flex>
        );
      case "Employee":
        return (
          <Flex gap={20} className={style.chartContainer} vertical>
            <Col span={24} className={style.pieChart}>
              <h3>Employee Overview</h3>
              <EmployeeOverview onCompare={handleCompare} />
            </Col>
            {compareData && (
              <Col span={24} className={style.pieChart}>
                <CompareWorkPerformance data={compareData} />
              </Col>
            )}
          </Flex>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Flex className={style.container}>
        <Flex className={style.statBoxContainer}>
          {statsData.map((stat, index) => (
            <Flex key={index} style={{ flex: 2 }}>
              <StatBox
                title={stat.title}
                subtitle={stat.subtitle}
                icon={stat.icon}
                // increase={stat.increase}
              />
            </Flex>
          ))}
          <Flex style={{ flex: 2 }}>
            <WeatherCard weather={data?.weatherPropertyModel || weatherData} />
          </Flex>
        </Flex>

        <Flex vertical gap={20} style={{ width: "100%" }}>
          <Segmented
            options={["Plant", "Harvest", "Plan", "Employee"]}
            value={activeTab}
            onChange={(value) => setActiveTab(value as string)}
            block
            className={style.segmented}
          />
          {renderTabContent()}
        </Flex>
      </Flex>
      {isModalVisible && <ExpiredPackageModal />}
    </>
  );
}

export default Dashboard;
