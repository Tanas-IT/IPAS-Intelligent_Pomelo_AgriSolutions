import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Flex, Select } from "antd";
import { dashboardService } from "@/services";
import { Loading } from "@/components";

const { Option } = Select;

const PlansByMonthChart: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number>(2025);

  const years = Array.from({ length: 6 }, (_, i) => 2020 + i);

  const fetchData = async (year: number) => {
    try {
      const statisticData = await dashboardService.getStatisticPlan(year);
      const processedData = statisticData.plansByMonth.map((item) => ({
        month: new Date(0, item.month - 1).toLocaleString("en-US", { month: "short" }),
        totalPlans: item.totalPlans,
      }));
      setData(processedData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching plans by month:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedYear);
  }, [selectedYear]);

  if (loading) return <Loading />;

  return (
    <div style={{ padding: "10px" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
      <Flex style={{justifyContent: 'center', alignItems: 'center', gap: '20px'}}>
      <h3>Plans by Month</h3>
        <span style={{ fontSize: "16px", marginRight: "10px", color: "#666" }}>Select Year: </span>
        </Flex>
        <Select value={selectedYear} onChange={setSelectedYear} style={{ width: "150px" }}>
          {years.map((year) => (
            <Option key={year} value={year}>
              {year}
            </Option>
          ))}
        </Select>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
          <XAxis dataKey="month" stroke="#666" />
          <YAxis stroke="#666" />
          <Tooltip
            contentStyle={{ background: "#fff", borderRadius: "5px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
            formatter={(value) => [`${value} plans`, "Total Plans"]}
          />
          <Bar dataKey="totalPlans" fill="#1890ff" radius={[5, 5, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PlansByMonthChart;