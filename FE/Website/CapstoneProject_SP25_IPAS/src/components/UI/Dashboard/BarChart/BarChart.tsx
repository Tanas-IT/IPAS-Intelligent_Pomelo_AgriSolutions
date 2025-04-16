// BarChart.tsx
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement, // Đăng ký BarElement
  Title as ChartTitle,
  Tooltip,
  Legend,
} from "chart.js";
import { Card, DatePicker, Flex, Typography } from "antd";
import { Bar } from "react-chartjs-2";
import dayjs from "dayjs";
import style from "./BarChart.module.scss";

const { Title } = Typography;

interface BarChartProps {
  title: string;
  year: dayjs.Dayjs;
  onYearChange: (year: dayjs.Dayjs) => void;
  data: any;
  options?: any;
}

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);

const BarChart: React.FC<BarChartProps> = ({ title, year, onYearChange, data, options }) => {
  return (
    <Card className={style.barChart}>
      <Flex className={style.barChartHeader}>
        <Title level={5} className={style.barChartTitle}>
          {title}
        </Title>
        <DatePicker value={year} onChange={onYearChange} picker="year" />
      </Flex>

      <Bar data={data} options={options} />
    </Card>
  );
};

export default BarChart;
