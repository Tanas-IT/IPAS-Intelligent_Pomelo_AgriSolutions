import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Card, DatePicker, Flex, Typography } from "antd";
import dayjs from "dayjs";
import style from "./LineChart.module.scss";

interface LineChartProps {
  title: string;
  year: dayjs.Dayjs;
  onYearChange: (year: dayjs.Dayjs) => void;
  data: any;
  options?: any;
}

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const LineChart: React.FC<LineChartProps> = ({ title, year, onYearChange, data, options }) => {
  return (
    <Card className={style.lineChart}>
      <Flex className={style.lineChartHeader}>
        <Typography.Title level={5} className={style.lineChartTitle}>
          {title}
        </Typography.Title>
        <DatePicker value={year} onChange={onYearChange} picker="year" />
      </Flex>

      <Line data={data} options={options} />
    </Card>
  );
};

export default LineChart;
