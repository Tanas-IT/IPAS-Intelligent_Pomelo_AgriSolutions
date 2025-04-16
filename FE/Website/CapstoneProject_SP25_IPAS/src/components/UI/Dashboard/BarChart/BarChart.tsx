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
import { Card, Typography } from "antd";
import { Bar } from "react-chartjs-2";

const { Title } = Typography;

interface BarChartProps {
  title: string;
  data: any;
  options?: any;
}

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);

const BarChart: React.FC<BarChartProps> = ({ title, data, options }) => {
  return (
    <Card>
      <Title level={5} style={{ marginBottom: 24 }}>
        {title}
      </Title>
      <Bar data={data} options={options} />
    </Card>
  );
};

export default BarChart;
