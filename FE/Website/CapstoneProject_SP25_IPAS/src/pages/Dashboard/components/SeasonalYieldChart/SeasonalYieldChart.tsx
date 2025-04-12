import React, { useState, useEffect } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { Empty, Flex, Select } from "antd";
import { dashboardService } from "@/services";
import { SeasonalYield } from "@/payloads/dashboard";
import { Loading } from "@/components";

const { Option } = Select;

const SeasonalYieldChart: React.FC = () => {
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState<number>(2024);

    const years = Array.from({ length: 6 }, (_, i) => 2020 + i);

    const fetchSeasonalYieldData = async (year: number) => {
        try {
            const seasonalData = await dashboardService.getSeasonalYield(year);
            console.log("seasonalData", seasonalData);

            if (seasonalData) {


                // Chuyển đổi dữ liệu thành định dạng cho Stacked Bar Chart
                const processedData = seasonalData.map((item: SeasonalYield) => {
                    const dataPoint: any = { harvestSeason: item.harvestSeason };

                    item.qualityStats.forEach((stat) => {
                        // Chuẩn hóa key để tránh lỗi (thay khoảng trắng bằng "_")
                        const key = stat.qualityType.toLowerCase().replace(" ", "_");
                        dataPoint[key] = stat.quantityYield;
                    });

                    return dataPoint;
                });
                console.log(processedData);


                setChartData(processedData);
                setLoading(false);
            } else {
                setChartData([]);
            }
        } catch (error) {
            console.error("Error fetching seasonal yield data:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSeasonalYieldData(selectedYear);
    }, [selectedYear]);

    const handleYearChange = (year: number) => {
        setSelectedYear(year);
        // setLoading(true);
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div style={styles.container}>
            <Flex style={styles.pickerContainer}>
                <Flex style={{ justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
                    <h3>Seasonal Yield</h3>
                    <div style={styles.pickerLabel}>Select Year: </div>
                </Flex>
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
            </Flex>

            <ResponsiveContainer width="100%" height={400}>
                {chartData.length > 0 ? (
                    <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="harvestSeason" />
                    <YAxis
                        label={{ value: "Quantity (kg)", angle: -90, position: "insideLeft" }}
                        domain={[0, "auto"]}
                    />
                    <Tooltip
                        formatter={(value, name) => {
                            const displayName = (name as string)
                                .replace("_", " ")
                                .replace(/\b\w/g, (char) => char.toUpperCase());
                            const unit = displayName === "Branches" ? "bundle" : "kg";
                            return [`${value} ${unit}`, displayName];
                        }}
                    />
                    <Legend />

                    {/* Stacked Bars cho các qualityType */}
                    <Bar dataKey="grade_1" stackId="a" fill="#13C2C2" name="Grade 1" />
                    <Bar dataKey="grade_2" stackId="a" fill="#82ca9d" name="Grade 2" />
                    <Bar dataKey="grade_3" stackId="a" fill="#ffc658" name="Grade 3" />
                    <Bar dataKey="leaves" stackId="a" fill="#a4de6c" name="Leaves" />
                    <Bar dataKey="branches" stackId="a" fill="#ff7300" name="Branches" />
                </BarChart>
                ) : (
                    <Flex justify="center" align="center" style={{ width: "100%" }}>
                    <Empty description="No data available" />
                </Flex>
                )}
                
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

export default SeasonalYieldChart;