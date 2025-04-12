import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Flex, Select } from "antd";
import { dashboardService } from "@/services";
import { StatisticPlanData } from "@/payloads/dashboard";
import { Loading } from "@/components";

const { Option } = Select;

const COLORS = ["#52c41a", "#f5222d", "#fa8c16", "#1890ff"];

const StatusDistributionChart: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number>(2025);

  const years = Array.from({ length: 6 }, (_, i) => 2020 + i);

  const fetchData = async (year: number) => {
    try {
      const statisticData = await dashboardService.getStatisticPlan(year);
      const statusData = Object.entries(statisticData.statusSummary.status).map(([name, value]) => ({
        name,
        value,
      }));
      setData(statusData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching status distribution:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedYear);
  }, [selectedYear]);

  if (loading) return <Loading />;

  return (
    <div style={chartContainerStyle}>
      <div style={pickerContainerStyle}>
        <Flex style={{ justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
          <h3>Status Distribution</h3>
          <span style={pickerLabelStyle}>Select Year: </span>
        </Flex>
        <Select value={selectedYear} onChange={setSelectedYear} style={selectStyle}>
          {years.map((year) => (
            <Option key={year} value={year}>
              {year}
            </Option>
          ))}
        </Select>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: "#fff", borderRadius: "5px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
            formatter={(value, name) => [`${value} plans`, name]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const chartContainerStyle = { padding: "10px" };
const pickerContainerStyle = { display: "flex", alignItems: "center", marginBottom: "20px" };
const pickerLabelStyle = { fontSize: "16px", marginRight: "10px", color: "#666" };
const selectStyle = { width: "150px" };

export default StatusDistributionChart;