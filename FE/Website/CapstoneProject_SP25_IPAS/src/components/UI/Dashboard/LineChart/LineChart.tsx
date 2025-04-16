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
import { Card, Typography } from "antd";

interface LineChartProps {
  title: string;
  data: any;
  options?: any;
}

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const LineChart: React.FC<LineChartProps> = ({ title, data, options }) => {
  return (
    <Card>
      <Typography.Title level={5} style={{ marginBottom: 16 }}>
        {title}
      </Typography.Title>
      <Line data={data} options={options} />
    </Card>
  );
};

export default LineChart;
