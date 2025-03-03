import { Card, Typography } from "antd";
import { FC } from "react";
import style from "./WeatherCard.module.scss";
import { CloudOutlined, SunOutlined, ThunderboltOutlined } from "@ant-design/icons";
import cloudy from "@/assets/images/resources/cloudy.png";
import rainy from "@/assets/images/resources/rainy.png";
import sunny from "@/assets/images/resources/sunny.png";
import snowy from "@/assets/images/resources/snowy.png";


const { Title, Text } = Typography;

interface WeatherCardProps {
  weather: {
    currentTemp: number;
    tempMax: number;
    tempMin: number;
    status: string;
    description: string;
    humidity: number;
    visibility: number;
    windSpeed: string;
    clouds: number;
  };
}

const weatherBackgrounds: Record<string, string> = {
    Clouds: cloudy,
    Rain: rainy,
    Snow: snowy,
    Sunny: sunny
  };

const getWeatherIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "clear":
      return <SunOutlined className={style.weatherIcon} />;
    case "clouds":
      return <CloudOutlined className={style.weatherIcon} />;
    case "thunderstorm":
      return <ThunderboltOutlined className={style.weatherIcon} />;
    default:
      return <CloudOutlined className={style.weatherIcon} />;
  }
};

const WeatherCard: FC<WeatherCardProps> = ({ weather }) => {
    const backgroundImage = weatherBackgrounds[weather.status] || cloudy;

  return (
    <Card className={style.weatherCard} style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
      <div className={style.weatherHeader}>
        {/* <div className={style.weatherIconWrapper}>
          {getWeatherIcon(weather.status)}
        </div> */}
          <Title level={5} className={style.tempText}>{weather.currentTemp}°C</Title>
          <Text className={style.weatherDescription}>{weather.description}</Text>
      </div>
    </Card>
  );
};

export default WeatherCard;
