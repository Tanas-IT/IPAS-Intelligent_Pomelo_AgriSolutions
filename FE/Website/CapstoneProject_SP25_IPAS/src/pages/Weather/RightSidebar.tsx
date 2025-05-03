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
  Carousel,
  Divider,
  Dropdown,
  Menu,
} from "antd";
import { WiDaySunny, WiCloud, WiRain } from "react-icons/wi"; // Weather Icons
import useWeatherStore from "@/stores/weatherStore";
import style from "./Weather.module.scss";
import axios from "axios";
import { Icons } from "@/assets";
import Slider from "react-slick";
import { useStyle } from "@/hooks";
import { MoreOutlined } from "@ant-design/icons";

const { Sider } = Layout;
const { Text, Title } = Typography;

interface WeatherData {
  main: {
    temp: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    description: string;
  }>;
  wind: {
    speed: number;
  };
  visibility: number;
}

// Khai báo kiểu dữ liệu cho dữ liệu đất (SoilGrids)
interface SoilData {
  properties: {
    soil_moisture_0_5cm: number;
    soil_temperature_0_5cm: number;
    soil_phh2o_0_5cm: number;
    nitrogen_0_5cm: number;
    phosphorus_0_5cm: number;
    potassium_0_5cm: number;
  };
}

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

const handleMenuClick = (e: any) => {
  console.log("Menu clicked:", e);
};

const menu = (
  <Menu onClick={handleMenuClick}>
    <Menu.Item key="1">Update Schedule</Menu.Item>
    <Menu.Item key="2">View Details</Menu.Item>
  </Menu>
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

const RightSidebar: React.FC = () => {
  const { forecast, fetchWeather, place } = useWeatherStore();
  const [isToday, setIsToday] = useState<boolean>(true);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [soilData, setSoilData] = useState<SoilData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedView, setSelectedView] = useState<"Today" | "Week">("Today");

  const { styles } = useStyle();

  const weatherApiKey = "c01125b343b6934e4c8a22f0edc300b7"; // Điền API Key vào đây
  const soilGridsApiUrl =
    "https://rest.isric.org/soilgrids/v2.0/classification/query?lon=24&lat=24&number_classes=5";

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

  const hourlyForecastData = [
    { time: "12 AM", temp: 24, weather: "Sunny", wind: 10 },
    { time: "01 AM", temp: 23, weather: "Clear", wind: 12 },
    { time: "02 AM", temp: 22, weather: "Clear", wind: 14 },
    { time: "03 AM", temp: 21, weather: "Cloudy", wind: 16 },
    { time: "04 AM", temp: 21, weather: "Cloudy", wind: 17 },
    { time: "05 AM", temp: 23, weather: "Sunny", wind: 18 },
    { time: "06 AM", temp: 25, weather: "Sunny", wind: 20 },
    { time: "07 AM", temp: 26, weather: "Sunny", wind: 22 },
    { time: "08 AM", temp: 27, weather: "Sunny", wind: 23 },
    { time: "09 AM", temp: 28, weather: "Clear", wind: 25 },
    { time: "10 AM", temp: 29, weather: "Clear", wind: 26 },
    { time: "11 AM", temp: 30, weather: "Sunny", wind: 27 },
    { time: "12 PM", temp: 31, weather: "Sunny", wind: 28 },
    { time: "01 PM", temp: 32, weather: "Clear", wind: 29 },
    { time: "02 PM", temp: 33, weather: "Sunny", wind: 30 },
    { time: "03 PM", temp: 34, weather: "Clear", wind: 31 },
    { time: "04 PM", temp: 35, weather: "Sunny", wind: 32 },
    { time: "05 PM", temp: 36, weather: "Sunny", wind: 33 },
    { time: "06 PM", temp: 37, weather: "Clear", wind: 34 },
    { time: "07 PM", temp: 38, weather: "Clear", wind: 35 },
    { time: "08 PM", temp: 39, weather: "Sunny", wind: 36 },
    { time: "09 PM", temp: 40, weather: "Clear", wind: 37 },
    { time: "10 PM", temp: 41, weather: "Sunny", wind: 38 },
    { time: "11 PM", temp: 42, weather: "Clear", wind: 39 },
  ];

  const farmAlertsData = [
    { alert: "Gió mạnh trên 20 km/h vào lúc 03:00 PM", level: "high" },
    { alert: "Mưa dự báo 20mm vào ngày mai", level: "medium" },
    { alert: "Sương mù dày đặc sáng mai", level: "low" },
  ];

  useEffect(() => {
    const fetchSoilData = async () => {
      try {
        const soilResponse = await axios.get(soilGridsApiUrl);
        setSoilData(soilResponse.data);
      } catch (error) {
        message.error("Không thể lấy dữ liệu đất.");
      }
    };
    fetchWeather(); // Lấy dữ liệu thời tiết khi load component
    fetchSoilData();
  }, [place]);

  // Dữ liệu cho Today (4 giờ tiếp theo)
  const todayData = forecast.slice(0, 4).map((item) => ({
    time: new Date(item.dt * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    temp: `${Math.round(item.main.temp)}°C`,
    icon: getWeatherIcon(item.weather[0].main),
  }));

  // Dữ liệu cho This Week (5 ngày tiếp theo)
  const weekData = forecast
    .filter((item, index) => index % 8 === 0) // Lấy dữ liệu mỗi ngày
    .map((item) => ({
      day: new Date(item.dt * 1000).toLocaleDateString("en-US", {
        weekday: "long",
      }),
      date: new Date(item.dt * 1000).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
      }),
      temp: `${Math.round(item.main.temp)}°C`,
      icon: getWeatherIcon(item.weather[0].main),
    }));

  const weeklyForecastData = [
    { day: "Mon", date: "Jan 29", temp: 22, weather: "Clouds" },
    { day: "Tue", date: "Jan 30", temp: 24, weather: "Rain" },
    { day: "Wed", date: "Jan 31", temp: 28, weather: "Sunny" },
    { day: "Thu", date: "Feb 1", temp: 24, weather: "Clouds" },
    { day: "Fri", date: "Feb 2", temp: 23, weather: "Rain" },
    { day: "Sat", date: "Feb 3", temp: 27, weather: "Sunny" },
    { day: "Sun", date: "Feb 4", temp: 29, weather: "Sunny" },
  ];

  return (
    <Sider className={style.rightSidebar} width={270}>
      {/* Segmented Button */}
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

      {/* Render data based on selection */}
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
        dataSource={farmAlertsData}
        renderItem={(item) => (
          <List.Item
            style={{
              backgroundColor:
                item.level === "high" ? "#FFCCCC" : item.level === "medium" ? "#FFF3CD" : "#D4EDDA",
              borderRadius: "5px",
              marginBottom: "10px",
              padding: "10px",
            }}
          >
            <Text
              style={{
                fontSize: "13px",
                fontWeight: "bold",
                color:
                  item.level === "high"
                    ? "#FF0000"
                    : item.level === "medium"
                    ? "#FF9900"
                    : "#28A745",
              }}
            >
              {item.alert}
            </Text>
            <Dropdown overlay={menu} trigger={["click"]}>
              <Button
                type="link"
                style={{
                  float: "right",
                  fontSize: "14px",
                  color:
                    item.level === "high"
                      ? "#FF0000"
                      : item.level === "medium"
                      ? "#FF9900"
                      : "#28A745",
                }}
              >
                <MoreOutlined />
              </Button>
            </Dropdown>
          </List.Item>
        )}
      />

      <Divider />
    </Sider>
  );
};

export default RightSidebar;
