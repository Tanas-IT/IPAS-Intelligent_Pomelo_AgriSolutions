import React, { useEffect, useState } from "react";
import {
  Layout,
  Typography,
  List,
  Row,
  Col,
  message,
  Card,
  Button,
  Segmented,
  Divider,
  Dropdown,
  Menu,
} from "antd";
import { WiDaySunny, WiCloud, WiRain } from "react-icons/wi";
import useWeatherStore from "@/stores/weatherStore";
import style from "./Weather.module.scss";
import { Icons } from "@/assets";
import Slider from "react-slick";
import { useStyle } from "@/hooks";
import { MoreOutlined } from "@ant-design/icons";
import { getFarmId } from "@/utils";

const { Sider } = Layout;
const { Text, Title } = Typography;

interface HourlyForecastItem {
  time: string;
  temp: number;
  weather: string;
  wind: number;
}

const getWeatherIcon = (weather: string) => {
  switch (weather) {
    case "Clear":
      return <WiDaySunny />;
    case "Clouds":
      return <WiCloud />;
    case "Rain":
      return <WiRain />;
    default:
      return <WiCloud />;
  }
};

function SampleNextArrow(props: any) {
  const { className, style, onClick } = props;
  return <div className={`${className}`} onClick={onClick} />;
}

function SamplePrevArrow(props: any) {
  const { className, style, onClick } = props;
  return <div className={`${className}`} onClick={onClick} />;
}

const CustomSlide: React.FC<{ item: HourlyForecastItem }> = ({ item }) => (
  <div
    style={{
      textAlign: "center",
      backgroundColor: "#f6f8f9",
      borderRadius: "12px",
      padding: "10px",
      margin: "0 5px",
      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
    }}
  >
    <Text strong style={{ fontSize: "14px", display: "block" }}>
      {item.time}
    </Text>
    <div style={{ margin: "10px 0" }}>{getWeatherIcon(item.weather)}</div>
    <Text style={{ fontSize: "16px", fontWeight: "bold" }}>{item.temp}</Text>
  </div>
);

const WeeklySlide: React.FC<{ item: any }> = ({ item }) => (
  <div
    style={{
      textAlign: "center",
      backgroundColor: "#f6f8f9",
      borderRadius: "12px",
      padding: "10px",
      margin: "0 5px",
      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
    }}
  >
    <Text strong style={{ fontSize: "14px", display: "block" }}>
      {item.day}
    </Text>
    <Text style={{ fontSize: "12px", color: "#888", whiteSpace: "nowrap" }}>{item.date}</Text>
    <div style={{ margin: "10px 0" }}>{getWeatherIcon(item.weather)}</div>
    <Text style={{ fontSize: "16px", fontWeight: "bold" }}>{item.temp}</Text>
  </div>
);

const handleMenuClick = (e: any) => {
  console.log("Menu clicked:", e);
};

const menu = (
  <Menu onClick={handleMenuClick}>
    <Menu.Item key="1">Update Schedule</Menu.Item>
    <Menu.Item key="2">View Details</Menu.Item>
  </Menu>
);

const RightSidebar: React.FC = () => {
  const { weather: weatherData, fetchWeather, place } = useWeatherStore();
  const [selectedView, setSelectedView] = useState<"Today" | "Week">("Today");
  const { styles } = useStyle();

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    className: styles.customSlick,
  };

  const hourlyForecastData = weatherData?.today.hourly.map(item => ({
    time: item.time,
    temp: Math.round(item.temperature - 273.15),
    weather: item.weather,
    wind: weatherData?.charts.windSpeed.find(c => c.time === item.time)?.value || 0,
  })) || [];

  const weeklyForecastData = weatherData?.week.daily.map(item => ({
    day: new Date(item.date).toLocaleDateString("en-US", { weekday: "short" }),
    date: new Date(item.date).toLocaleDateString("en-US", { day: "2-digit", month: "short" }),
    temp: Math.round(item.max - 273.15),
    weather: item.weather,
  })) || [];

  const farmAlertsData = [
    { alert: `Strong wind above ${weatherData?.current.windSpeed || 0} km/h expected`, level: "high" },
    { alert: `Rain forecast for ${weatherData?.week.daily.find(d => d.weather === "Rain")?.date || "tomorrow"}`, level: "medium" },
    { alert: "Possible fog in the morning", level: "low" },
  ];

  useEffect(() => {
    fetchWeather(Number(getFarmId()));
  }, [place, fetchWeather]);

  return (
    <Sider className={style.rightSidebar} width={270}>
      <Row justify="space-between" align="middle" style={{ marginBottom: "10px" }}>
        <Col span={12}>
          <Segmented
            options={["Today", "Week"]}
            value={selectedView}
            onChange={setSelectedView}
            style={{ width: "100%" }}
          />
        </Col>
      </Row>

      {selectedView === "Today" ? (
        <div style={{ position: "relative", width: "80%", marginLeft: "20px" }}>
          <Slider {...settings}>
            {hourlyForecastData.map((item, index) => (
              <CustomSlide key={index} item={item} />
            ))}
          </Slider>
        </div>
      ) : (
        <div style={{ position: "relative", width: "80%", marginLeft: "20px" }}>
          <Slider {...settings}>
            {weeklyForecastData.map((item, index) => (
              <WeeklySlide key={index} item={item} />
            ))}
          </Slider>
        </div>
      )}

      <Divider />

      <List
        dataSource={weatherData?.warnings}
        renderItem={(item) => (
          <List.Item
            style={{
              backgroundColor:"#FFF3CD",
              borderRadius: "5px",
              marginBottom: "10px",
              padding: "10px",
            }}
          >
            <Text
              style={{
                fontSize: "13px",
                fontWeight: "bold",
                color: "#FF9900"
              }}
            >
              {item}
            </Text>
            
          </List.Item>
        )}
      />

      <Divider />
    </Sider>
  );
};

export default RightSidebar;