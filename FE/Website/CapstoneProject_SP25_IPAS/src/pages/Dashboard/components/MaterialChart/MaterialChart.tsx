import React, { useState, useEffect } from "react";
import {
    BarChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { Select } from "antd";
import { dashboardService, worklogService } from "@/services";
import { MaterialInstore } from "@/payloads/dashboard";
import { Loading } from "@/components";

const { Option } = Select;

const formatMonth = (monthStr: string): string => {
    const [month, year] = monthStr.split("-");
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleString("default", { month: "long", year: "numeric" });
};

const MaterialChart: React.FC = () => {
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState<number>(2024);

    const years = Array.from({ length: 6 }, (_, i) => 2020 + i);

    const fetchMaterialData = async (year: number) => {
        try {
            const materialData = await dashboardService.getMaterialInStore(year);

            const processedData = materialData.map((item: MaterialInstore) => {
                const dataPoint: any = { month: formatMonth(item.month) };

                item.materials.forEach((material) => {
                    const { productType, unitOfMaterials } = material;
                    const { value, unit } = unitOfMaterials;

                    if (unit === "kg") {
                        if (productType === "Grade 2") dataPoint.grade2 = value;
                        else if (productType === "Grade 3") dataPoint.grade3 = value;
                        else if (productType === "Grade 1") dataPoint.grade1 = value;
                        else if (productType === "Leaves") dataPoint.leaves = value;
                    } else if (unit === "bundle") {
                        if (productType === "Branches") dataPoint.branches = value;
                    }
                });

                return dataPoint;
            });

            setChartData(processedData);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching material data:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMaterialData(selectedYear);
    }, [selectedYear]);

    const handleYearChange = (year: number) => {
        setSelectedYear(year);
        setLoading(true);
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div style={styles.container}>
            <div style={styles.pickerContainer}>
                <span style={styles.pickerLabel}>Select Year: </span>
                <Select
                    value={selectedYear}
                    onChange={handleYearChange}
                    style={styles.select}
                    placeholder="Select a year"
                >
                    {years.map((year) => (
                        <Option key={year} value={year}>
                            {year}
                        </Option>
                    ))}
                </Select>
            </div>

            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />

                    <YAxis
                        yAxisId="left"
                        label={{ value: "Kg", angle: -90, position: "insideLeft" }}
                        domain={[0, "auto"]}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        label={{ value: "Bundle", angle: -90, position: "insideRight" }}
                        domain={[0, 50]}
                        allowDecimals={false}
                    />
                    <Tooltip
                        formatter={(value, name) => {
                            const unit = name === "Branches" ? "bundle" : "kg";
                            console.log(`Name: ${name}, Unit: ${unit}, Value: ${value}`);
                            return [`${value} ${unit}`, name];
                        }}
                    />
                    <Legend />

                    {/* cho đơn vị Kg */}
                    <Bar yAxisId="left" dataKey="grade1" fill="#13C2C2" name="Grade 1" />
                    <Bar yAxisId="left" dataKey="grade2" fill="#82ca9d" name="Grade 2" />
                    <Bar yAxisId="left" dataKey="grade3" fill="#ffc658" name="Grade 3" />
                    <Bar yAxisId="left" dataKey="leaves" fill="#a4de6c" name="Leaves" />

                    {/* cho đơn vị Bundle */}
                    {/* <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="branches"
                        stroke="#ff7300"
                        name="Branches"
                        strokeWidth={3}
                        dot={{ r: 10 }}
                    /> */}
                    <Bar yAxisId="right" dataKey="branches" fill="#ff7300" name="Branches" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

const styles = {
    container: {
        padding: "10px",
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        // background: "white",
        // borderRadius: "10px"
    },
    loadingContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "400px",
    },
    pickerContainer: {
        display: "flex",
        alignItems: "center",
        marginBottom: "20px",
    },
    pickerLabel: {
        fontSize: "16px",
        marginRight: "10px",
    },
    select: {
        width: "150px",
    },
};

export default MaterialChart;