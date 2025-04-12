import React from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, ResponsiveContainer } from "recharts";
import { EmployeeListItem } from "@/payloads/dashboard";

interface CompareWorkPerformanceProps {
  data: EmployeeListItem[];
}

const CompareWorkPerformance: React.FC<CompareWorkPerformanceProps> = ({ data }) => {
  const chartData = data.map((employee) => ({
    name: employee.name,
    score: employee.score,
    taskSuccess: employee.taskSuccess,
    taskFail: employee.taskFail,
    totalTask: employee.totaTask,
    completionRate: employee.totaTask > 0 ? (employee.taskSuccess / employee.totaTask) * 100 : 0,
  }));

  const COLORS = ["#1890ff", "#52c41a", "#fa8c16", "#722ed1", "#eb2f96"];

  return (
    <div style={{ padding: "10px", background: "#fff", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
      <h3 style={{ marginBottom: 20 }}>Performance Comparison</h3>
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="name" />
          <PolarRadiusAxis angle={90} domain={[0, "auto"]} />
          <Tooltip
            contentStyle={{ background: "#fff", borderRadius: "5px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
            formatter={(value, name) => [
              name === "completionRate" ? `${Number(value).toFixed(1)}%` : value,
              name === "completionRate"
                ? "Completion Rate"
                : name === "taskSuccess"
                ? "Task Success"
                : name === "taskFail"
                ? "Task Fail"
                : name,
            ]}
          />
          {[
            { key: "score", name: "Score", fill: COLORS[0] },
            { key: "taskSuccess", name: "Task Success", fill: COLORS[1] },
            { key: "taskFail", name: "Task Fail", fill: COLORS[2] },
            { key: "totalTask", name: "Total Task", fill: COLORS[3] },
            { key: "completionRate", name: "Completion Rate", fill: COLORS[4] },
          ].map((indicator, index) => (
            <Radar
              key={indicator.key}
              name={indicator.name}
              dataKey={indicator.key}
              stroke={indicator.fill}
              fill={indicator.fill}
              fillOpacity={0.6}
            />
          ))}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CompareWorkPerformance;