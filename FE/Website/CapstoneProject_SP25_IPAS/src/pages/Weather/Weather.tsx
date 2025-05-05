// import useWeatherStore from "@/stores/weatherStore";
// import {
//   Button,
//   Input,
//   Spin,
//   Alert,
//   Typography,
//   Layout,
//   Flex,
//   Row,
//   Col,
//   Card,
//   Tooltip,
//   Segmented,
//   List,
// } from "antd";
// import { AppstoreOutlined, BarsOutlined, SearchOutlined } from "@ant-design/icons";
// import { useEffect, useState } from "react";
// import Sider from "antd/es/layout/Sider";
// import { Content } from "antd/es/layout/layout";
// import { Icons, Images } from "@/assets";
// import style from "./Weather.module.scss";
// import { Bar, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
// import { useStyle } from "@/hooks";
// import RightSidebar from "./RightSidebar";

// const { Title, Text } = Typography;

// function Weather() {
//   type ViewMode = "temp" | "wind" | "rain";
//   const [viewMode, setViewMode] = useState<ViewMode>("temp");
//   const {
//     weather,
//     isLoading,
//     error,
//     place,
//     setPlace,
//     fetchWeather,
//     isSearchVisible,
//     toggleSearch,
//   } = useWeatherStore((state) => state);

//   const [searchValue, setSearchValue] = useState<string>("");
//   const { styles } = useStyle();

//   useEffect(() => {
//     fetchWeather();
//   }, [place, fetchWeather]);

//   const labelMapping = {
//     temp: "Temperature",
//     wind: "Wind Speed",
//     rain: "Rainfall",
//   };

//   const handleSegmentChange = (value: string) => {
//     setViewMode(value.toLowerCase() as ViewMode);
//   };

//   const weatherImages = {
//     Clouds: Images.cloudy,
//     Clear: Images.sunny,
//     Rain: Images.rainy,
//     Snow: Images.snowy,
//     Haze: Images.cloudy,
//     Mist: Images.cloudy,
//   };

//   const weatherImage = weather?.weather
//     ? weatherImages[weather.weather[0]?.main as keyof typeof weatherImages]
//     : Images.cloudy;

//   const backgroundImages = {
//     Clear: "linear-gradient(to right, #f3b07c, #fcd283)",
//     Clouds: "linear-gradient(to right, #57d6d4, #7leeec)",
//     Rain: "linear-gradient(to right, #5bc8fb, #80eaff)",
//     Snow: "linear-gradient(to right, #aff2ff, #fff)",
//     Haze: "linear-gradient(to right, #57d6d4, #7leeec)",
//     Mist: "linear-gradient(to right, #57d6d4, #7leeec)",
//   };

//   const iconWeathers = {
//     Clear: Icons.wind,
//     Clouds: Icons.wind,
//     Rain: Icons.wind,
//     Snow: Icons.wind,
//     Haze: Icons.wind,
//     Mist: Icons.wind,
//   };

//   const backgroundImage = weather?.weather
//     ? backgroundImages[weather.weather[0]?.main as keyof typeof backgroundImages]
//     : "linear-gradient(to right, #f3b07c, #fcd283)";

//   const data = [
//     { icon: "🌥", temp: "20", wind: "10", rain: "5", time: "Morning" },
//     { icon: "😎", temp: "34", wind: "15", rain: "0", time: "Afternoon" },
//     { icon: "🌥", temp: "28", wind: "12", rain: "7", time: "Evening" },
//     { icon: "🌥", temp: "22", wind: "8", rain: "15", time: "Night" },
//   ];

//   return (
//     <Layout className={style.container}>
//       <Content style={{ flex: 3 }}>
//         <Flex gap="middle" vertical={true}>
//           <Flex gap="middle" vertical={false} style={{ flex: 2 }}>
//             <div className={style.card} style={{ backgroundImage: backgroundImage }}>
//               <Row>
//                 <Col span={3}>
//                   <div className={style.weatherIcon}>
//                     <Icons.cloud color="#326E2F" />
//                   </div>
//                 </Col>
//                 <Col span={21}>
//                   <Flex gap="2px" vertical={true}>
//                     <Text strong>Weather</Text>
//                     <Text>What’s the weather?</Text>
//                   </Flex>
//                 </Col>
//               </Row>
//               <h3 className={style.mainValue}>22°C</h3>
//               <p>Partly Cloudy</p>
//               <Flex vertical={false} gap="middle" className={style.weatherDetails}>
//                 <div>
//                   <p>Pressure</p>
//                   <h3>800 mb</h3>
//                 </div>
//                 <div>
//                   <p>Visibility</p>
//                   <h3>800 km</h3>
//                 </div>
//                 <div>
//                   <p>Humadity</p>
//                   <h3>800%</h3>
//                 </div>
//               </Flex>
//             </div>
//             <div
//               className={style.card}
//               style={{ backgroundImage: `url(${Images.airQuality})`, color: "white" }}
//             >
//               <Row>
//                 <Col span={3}>
//                   <div className={style.weatherIcon}>
//                     <Icons.wind color="#326E2F" />
//                   </div>
//                 </Col>
//                 <Col span={21}>
//                   <Flex gap="2px" vertical={true} color="white">
//                     <Text strong style={{ color: "#ffffff" }}>
//                       Air Quality
//                     </Text>
//                     <Text style={{ color: "#ffffff" }}>Main pollution: PM 2.5</Text>
//                   </Flex>
//                 </Col>
//               </Row>
//               <h3 className={style.mainValue}>390</h3>
//               <p>West Wind</p>
//             </div>
//           </Flex>
//           <Flex style={{ flex: 3 }}>
//             <div style={{ flex: 1.5 }} className={style.temperature}>
//               <div style={{ display: "flex", justifyContent: "space-between" }}>
//                 <div>
//                   <h2>How’s the</h2>
//                   <h2>{labelMapping[viewMode]} today?</h2>
//                 </div>
//                 <Segmented
//                   options={[
//                     { value: "Temp", icon: <Icons.temperature /> },
//                     { value: "Wind", icon: <Icons.wind /> },
//                     { value: "Rain", icon: <Icons.cloudRain /> },
//                   ]}
//                   onChange={handleSegmentChange}
//                   className={`${styles.customSegment}`}
//                   style={{
//                     display: "flex",
//                     justifyContent: "center",
//                     alignItems: "center",
//                     backgroundColor: "#D3F0E5",
//                   }}
//                 />
//               </div>
//               <Row gutter={16} className={style.rowContainer}>
//                 {/* chart */}
//                 <div className={style.chart}>
//                   <ResponsiveContainer width="100%" height={250}>
//                     <LineChart data={data}>
//                       <XAxis
//                         dataKey={viewMode}
//                         padding={{ left: 40, right: 40 }}
//                         stroke="#000000"
//                         tick={{ fontSize: 14 }}
//                         hide
//                       />
//                       <YAxis domain={[0, 100]} hide />
//                       <Tooltip />
//                       <Line
//                         type="monotone"
//                         dataKey={viewMode}
//                         stroke="#ff7300"
//                         strokeWidth={2}
//                         dot={{ r: 4 }}
//                         connectNulls
//                       />
//                     </LineChart>
//                   </ResponsiveContainer>
//                 </div>

//                 {/* card */}
//                 {data.map((item, index) => (
//                   <Col key={index} xs={6} sm={6} md={4} lg={4}>
//                     <Card className={style.todayCard}>
//                       <div className={style.icon}>{item.icon}</div>
//                       <Text strong className={style.temp} style={{ whiteSpace: "nowrap" }}>
//                         {viewMode === "temp" ? (
//                           <>
//                             {item[viewMode]}
//                             <span style={{ fontSize: "14px" }}>°</span>
//                           </>
//                         ) : (
//                           <>
//                             {item[viewMode]}
//                             <span style={{ fontSize: "12px", color: "#999", marginLeft: "5px" }}>
//                               {viewMode === "wind" ? "km/h" : "mm"}
//                             </span>
//                           </>
//                         )}
//                       </Text>

//                       <br />
//                       <br />
//                       <br />
//                       <br />
//                       <Text className={style.time} style={{ whiteSpace: "nowrap" }}>
//                         {item.time}
//                       </Text>
//                     </Card>
//                   </Col>
//                 ))}
//               </Row>
//             </div>
//             <div
//               className={style.boyImageContainer}
//               style={{
//                 backgroundImage: `url(${Images.boy})`,
//               }}
//             >
//               <div>
//                 <h4>Tomorrow</h4>
//                 <h2>Hau Giang</h2>
//               </div>
//               <div>
//                 <h1>20°C</h1>
//                 <p>Rainny</p>
//               </div>
//             </div>
//           </Flex>
//         </Flex>
//       </Content>
//       <RightSidebar />
//     </Layout>
//   );
// }

// export default Weather;
import useWeatherStore from "@/stores/weatherStore";
import {
  Button,
  Input,
  Spin,
  Alert,
  Typography,
  Layout,
  Flex,
  Row,
  Col,
  Card,
  Tooltip,
  Segmented,
  List,
} from "antd";
import { AppstoreOutlined, BarsOutlined, SearchOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import Sider from "antd/es/layout/Sider";
import { Content } from "antd/es/layout/layout";
import { Icons, Images } from "@/assets";
import style from "./Weather.module.scss";
import { LineChart, ResponsiveContainer, XAxis, YAxis, Line } from "recharts";
import { useStyle } from "@/hooks";
import RightSidebar from "./RightSidebar";
import { WeatherChartData, WeatherHourly } from "@/payloads";

const { Title, Text } = Typography;

interface ChartDataPoint {
  time: string;
  temperature?: number;
  windSpeed?: number;
  rainfall?: number;
  icon: string;
}

interface PeriodData {
  time: string;
  temperature: number;
  windSpeed: number;
  rainfall: number;
  icon: string;
}

function Weather() {
  type ViewMode = "temperature" | "windSpeed" | "rainfall";
  const [viewMode, setViewMode] = useState<ViewMode>("temperature");
  const {
    weather: weatherData,
    isLoading,
    error,
    place,
    setPlace,
    fetchWeather,
    isSearchVisible,
    toggleSearch,
  } = useWeatherStore((state) => state);

  const [searchValue, setSearchValue] = useState<string>("");
  const { styles } = useStyle();

  useEffect(() => {
    fetchWeather();
  }, [place, fetchWeather]);

  const labelMapping: Record<ViewMode, string> = {
    temperature: "Temperature",
    windSpeed: "Wind Speed",
    rainfall: "Rainfall",
  };

  const weatherImages: Record<string, string> = {
    Clouds: Images.cloudy,
    Clear: Images.sunny,
    Rain: Images.rainy,
    Snow: Images.snowy,
    Haze: Images.cloudy,
    Mist: Images.cloudy,
  };

  const backgroundImages: Record<string, string> = {
    Clear: "linear-gradient(to right, #f3b07c, #fcd283)",
    Clouds: "linear-gradient(to right, #57d6d4, #7leeec)",
    Rain: "linear-gradient(to right, #5bc8fb, #80eaff)",
    Snow: "linear-gradient(to right, #aff2ff, #fff)",
    Haze: "linear-gradient(to right, #57d6d4, #7leeec)",
    Mist: "linear-gradient(to right, #57d6d4, #7leeec)",
  };

  const windDirectionMap: Record<string, string> = {
    N: "North",
    NNE: "North-Northeast",
    NE: "Northeast",
    ENE: "East-Northeast",
    E: "East",
    ESE: "East-Southeast",
    SE: "Southeast",
    SSE: "South-Southeast",
    S: "South",
    SSW: "South-Southwest",
    SW: "Southwest",
    WSW: "West-Southwest",
    W: "West",
    WNW: "West-Northwest",
    NW: "Northwest",
    NNW: "North-Northwest",
  };


  const getWeatherImage = (weather?: string): string => {
    return weather && weather in weatherImages
      ? weatherImages[weather]
      : Images.cloudy;
  };

  const getBackgroundImage = (weather?: string): string => {
    return weather && weather in backgroundImages
      ? backgroundImages[weather]
      : "linear-gradient(to right, #f3b07c, #fcd283)";
  };

  const getWeatherIcon = (weather: string): string => {
    switch (weather) {
      case "Clear":
        return "🌞";
      case "Clouds":
        return "🌥";
      case "Rain":
        return "🌧";
      default:
        return "🌥";
    }
  };

  const aggregatePeriodData = (): PeriodData[] => {
    if (!weatherData) return [];

    const periods = [
      { time: "Morning", start: 6, end: 11 },
      { time: "Afternoon", start: 12, end: 17 },
      { time: "Evening", start: 18, end: 23 },
      { time: "Night", start: 0, end: 5 },
    ];

    return periods.map((period) => {
      const hourlyData = weatherData.today.hourly.filter((item: WeatherHourly) => {
        const hour = parseInt(item.time.split(":")[0], 10);
        return period.start <= period.end
          ? hour >= period.start && hour <= period.end
          : hour >= period.start || hour <= period.end;
      });

      const temperatureData = weatherData.charts.temperature.filter((item: WeatherChartData) => {
        const hour = parseInt(item.time.split(":")[0], 10);
        return period.start <= period.end
          ? hour >= period.start && hour <= period.end
          : hour >= period.start || hour <= period.end;
      });

      const windSpeedData = weatherData.charts.windSpeed.filter((item: WeatherChartData) => {
        const hour = parseInt(item.time.split(":")[0], 10);
        return period.start <= period.end
          ? hour >= period.start && hour <= period.end
          : hour >= period.start || hour <= period.end;
      });

      const rainfallData = weatherData.charts.rainfall.filter((item: WeatherChartData) => {
        const hour = parseInt(item.time.split(":")[0], 10);
        return period.start <= period.end
          ? hour >= period.start && hour <= period.end
          : hour >= period.start || hour <= period.end;
      });

      // Calculate average values
      const avgTemperature = temperatureData.length
        ? temperatureData.reduce((sum: number, item: WeatherChartData) => sum + item.value, 0) / temperatureData.length
        : 0;
      const avgWindSpeed = windSpeedData.length
        ? windSpeedData.reduce((sum: number, item: WeatherChartData) => sum + item.value, 0) / windSpeedData.length
        : 0;
      const avgRainfall = rainfallData.length
        ? rainfallData.reduce((sum: number, item: WeatherChartData) => sum + item.value, 0) / rainfallData.length
        : 0;

      // Determine most frequent weather for icon
      const weatherCounts = hourlyData.reduce((acc: Record<string, number>, item: WeatherHourly) => {
        acc[item.weather] = (acc[item.weather] || 0) + 1;
        return acc;
      }, {});
      const mostFrequentWeather = Object.keys(weatherCounts).reduce(
        (a, b) => (weatherCounts[a] > weatherCounts[b] ? a : b),
        "Clouds"
      );

      return {
        time: period.time,
        temperature: avgTemperature,
        windSpeed: avgWindSpeed,
        rainfall: avgRainfall,
        icon: getWeatherIcon(mostFrequentWeather),
      };
    });
  };

  const periodData: PeriodData[] = aggregatePeriodData();

  const chartData: ChartDataPoint[] = periodData.map((item: PeriodData) => ({
    time: item.time,
    temperature: item.temperature,
    windSpeed: item.windSpeed,
    rainfall: item.rainfall,
    icon: item.icon,
  }));

  const handleSegmentChange = (value: string) => {
    setViewMode(value.toLowerCase() as ViewMode);
  };

  const kelvinToCelsius = (kelvin: number): number => Math.round(kelvin - 273.15);

  return (
    <Layout className={style.container}>
      <Content style={{ flex: 3 }}>
        {isLoading && <Spin />}
        {error && <Alert message={error} type="error" />}
        <Flex gap="middle" vertical>
          <Flex gap="middle" vertical={false} style={{ flex: 2 }}>
            <div
              className={style.card}
              style={{ backgroundImage: getBackgroundImage(weatherData?.current.weather) }}
            >
              <Row>
                <Col span={3}>
                  <div className={style.weatherIcon}>
                    <Icons.cloud color="#326E2F" />
                  </div>
                </Col>
                <Col span={21}>
                  <Flex gap="2px" vertical>
                    <Text strong>Weather</Text>
                    <Text>{weatherData?.location.name || "Loading..."}</Text>
                  </Flex>
                </Col>
              </Row>
              <h3 className={style.mainValue}>
                {weatherData?.current.temperature
                  ? `${weatherData.current.temperature}°C`
                  : "N/A"}
              </h3>
              <p>{weatherData?.current.description || "Loading..."}</p>
              <Flex vertical={false} gap="middle" className={style.weatherDetails}>
                <div>
                  <p>Pressure</p>
                  <h3>{weatherData?.current.pressure || 0} mb</h3>
                </div>
                <div>
                  <p>Visibility</p>
                  <h3>{weatherData?.current.visibility || 0} km</h3>
                </div>
                <div>
                  <p>Humidity</p>
                  <h3>{weatherData?.current.humidity || 0}%</h3>
                </div>
              </Flex>
            </div>
            <div
              className={style.card}
              style={{ backgroundImage: `url(${Images.airQuality})`, color: "white" }}
            >
              <Row>
                <Col span={3}>
                  <div className={style.weatherIcon}>
                    <Icons.wind color="#326E2F" />
                  </div>
                </Col>
                <Col span={21}>
                  <Flex gap="2px" vertical color="white">
                    <Text strong style={{ color: "#ffffff" }}>
                      Air Quality
                    </Text>
                    <Text style={{ color: "#ffffff" }}>
                      Main pollution: {weatherData?.airQuality.mainPollution || "N/A"}
                    </Text>
                  </Flex>
                </Col>
              </Row>
              <h3 className={style.mainValue}>{weatherData?.airQuality.value || 0}</h3>
              <p>
                {weatherData?.current.windDirection
                  ? `${windDirectionMap[weatherData.current.windDirection] || weatherData.current.windDirection} Wind`
                  : "N/A"}
              </p>

            </div>
          </Flex>
          <Flex style={{ flex: 3 }}>
            <div style={{ flex: 1.5 }} className={style.temperature}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <h2>How’s the</h2>
                  <h2>{labelMapping[viewMode]} today?</h2>
                </div>
                <Segmented
                  options={[
                    { value: "temperature", icon: <Icons.temperature /> },
                    { value: "windSpeed", icon: <Icons.wind /> },
                    { value: "rainfall", icon: <Icons.cloudRain /> },
                  ]}
                  onChange={handleSegmentChange}
                  className={`${styles.customSegment}`}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#D3F0E5",
                  }}
                />
              </div>
              <Row gutter={16} className={style.rowContainer}>
                <div className={style.chart}>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData}>
                      <XAxis
                        dataKey="time"
                        padding={{ left: 40, right: 40 }}
                        stroke="#000000"
                        tick={{ fontSize: 14 }}
                        hide
                      />
                      <YAxis
                        domain={[0, viewMode === "temperature" ? 350 : 100]}
                        hide
                      />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey={viewMode}
                        stroke="#ff7300"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        connectNulls
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {periodData.map((item: PeriodData, index: number) => (
                  <Col key={index} xs={6} sm={6} md={4} lg={4}>
                    <Card className={style.todayCard}>
                      <div className={style.icon}>{item.icon}</div>
                      <Text strong className={style.temp} style={{ whiteSpace: "nowrap" }}>
                        {viewMode === "temperature" ? (
                          <>
                            {kelvinToCelsius(item.temperature)}
                            <span style={{ fontSize: "14px" }}>°C</span>
                          </>
                        ) : (
                          <>
                            {item[viewMode]?.toFixed(1)}
                            <span style={{ fontSize: "12px", color: "#999", marginLeft: "5px" }}>
                              {viewMode === "windSpeed" ? "km/h" : "mm"}
                            </span>
                          </>
                        )}
                      </Text>
                      <br />
                      <br />
                      <br />
                      <br />
                      <Text className={style.time} style={{ whiteSpace: "nowrap" }}>
                        {item.time}
                      </Text>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
            <div
              className={style.boyImageContainer}
              style={{
                backgroundImage: `url(${Images.boy})`,
              }}
            >
              <div>
                <h4>Tomorrow</h4>
                <h2>{weatherData?.location.name || "Hau Giang"}</h2>
              </div>
              <div>
                <h1>
                  {weatherData?.week.daily[1]?.max
                    ? `${kelvinToCelsius(weatherData.week.daily[1].max)}°C`
                    : "N/A"}
                </h1>
                <p>{weatherData?.week.daily[1]?.weather || "N/A"}</p>
              </div>
            </div>
          </Flex>
        </Flex>
      </Content>
      <RightSidebar />
    </Layout>
  );
}

export default Weather;