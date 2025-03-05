import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import styles from "./PlantHealthStatus.module.scss";

interface PlantHealthStatusProps {
    data: Record<string, number>;
}

const COLORS = {
    healthy: "#4CAF50",
    moderate: "#FF9800",
    unhealthy: "#F44336",
};

const PlantHealthStatus: React.FC<PlantHealthStatusProps> = ({ data }) => {
    const chartData = Object.keys(data).map((key) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: data[key],
    }));

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Plant Health Status</h3>
            <ResponsiveContainer width="100%" height={200}>
                <BarChart barSize={10}  data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis axisLine={false} tickLine={false} tickMargin={10}  />
                    <Tooltip />
                    <Bar dataKey="value" radius={[10, 10, 0, 0]} background={{ fill: '#eee' }}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PlantHealthStatus;
