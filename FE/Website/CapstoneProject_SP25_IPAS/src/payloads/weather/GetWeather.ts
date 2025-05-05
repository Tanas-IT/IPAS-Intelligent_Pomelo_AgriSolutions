export interface WeatherLocation {
    name: string;
    lat: number;
    lon: number;
    timezone: string;
    updatedAt: string;
  }
  
  export interface WeatherCurrent {
    temperature: number;
    weather: string;
    description: string;
    icon: string;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDeg: number;
    windDirection: string;
    visibility: number;
  }
  
  export interface WeatherAirQuality {
    mainPollution: string;
    value: number;
    aqi: number;
  }
  
  export interface WeatherHourly {
    time: string;
    temperature: number;
    weather: string;
    icon: string;
  }
  
  export interface WeatherDaily {
    date: string;
    min: number;
    max: number;
    weather: string;
    icon: string;
  }
  
  export interface WeatherChartData {
    time: string;
    value: number;
  }
  
  export interface WeatherData {
    location: WeatherLocation;
    current: WeatherCurrent;
    airQuality: WeatherAirQuality;
    today: {
      hourly: WeatherHourly[];
    };
    week: {
      daily: WeatherDaily[];
    };
    charts: {
      temperature: WeatherChartData[];
      windSpeed: WeatherChartData[];
      rainfall: WeatherChartData[];
    };
    warnings: string[];
  }