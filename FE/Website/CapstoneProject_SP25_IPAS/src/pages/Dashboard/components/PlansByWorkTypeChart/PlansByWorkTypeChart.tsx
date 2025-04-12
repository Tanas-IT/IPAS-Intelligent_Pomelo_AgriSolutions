import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Flex, Select } from "antd";
import { dashboardService } from "@/services";
import { StatisticPlanData } from "@/payloads/dashboard";
import { Loading } from "@/components";

const { Option } = Select;

const PlansByWorkTypeChart: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number>(2025);

  const years = Array.from({ length: 6 }, (_, i) => 2020 + i);

  const fetchData = async (year: number) => {
    try {
      const statisticData = await dashboardService.getStatisticPlan(year);
      const workTypeData = Object.entries(statisticData.planByWorkType).map(([name, value]) => ({
        name,
        value,
      }));
      setData(workTypeData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching plans by work type:", error);
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
          <h3>Plans by Work Type</h3>
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
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
          <XAxis type="number" stroke="#666" allowDecimals={false} />
          <YAxis dataKey="name" type="category" stroke="#666" />
          <Tooltip
            contentStyle={{ background: "#fff", borderRadius: "5px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
            formatter={(value) => [`${value} plans`, "Plans"]}
          />
          <Bar dataKey="value" fill="#722ed1" radius={[0, 5, 5, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const chartContainerStyle = { padding: "10px" };
const pickerContainerStyle = { display: "flex", alignItems: "center", marginBottom: "20px" };
const pickerLabelStyle = { fontSize: "16px", marginRight: "10px", color: "#666" };
const selectStyle = { width: "150px" };

export default PlansByWorkTypeChart;