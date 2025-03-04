import React, { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Select, Row, Col } from "antd";
import { Icons } from "@/assets";

const { Option } = Select;

interface SynchronizedAreaChartProps {
    data: {
        season: string;
        count: number;
        typeOfProduct: {
            plantName: string;
            masterTypeName: string;
            totalQuantity: number;
        }[];
    }[];
}

const SynchronizedAreaChart: React.FC<SynchronizedAreaChartProps> = ({ data }) => {
    const [selectedYear, setSelectedYear] = useState<number>(2023);
    const [selectedMonth, setSelectedMonth] = useState<number>(3);

    const formatChartData = () => {
        const groupedData: Record<string, Record<string, number>> = {};

        const allProductTypes = Array.from(
            new Set(data.flatMap((season) => season.typeOfProduct.map((product) => product.masterTypeName)))
        );

        data.forEach((seasonData) => {
            seasonData.typeOfProduct.forEach((product) => {
                const plantName = product.plantName;
                const productType = product.masterTypeName;

                if (!groupedData[plantName]) {
                    groupedData[plantName] = {};
                    allProductTypes.forEach((type) => {
                        groupedData[plantName][type] = 0;
                    });
                }

                groupedData[plantName][productType] += product.totalQuantity;
            });
        });

        return Object.entries(groupedData).map(([plantName, products]) => ({
            plantName,
            ...products,
        }));
    };


    const chartData = formatChartData();
    console.log(chartData);

    const productTypes = Array.from(
        new Set(data.flatMap((season) => season.typeOfProduct.map((product) => product.masterTypeName)))
    );

    const handleYearChange = (value: number) => {
        setSelectedYear(value);
        // Gọi lại API với năm mới
    };

    const handleMonthChange = (value: number) => {
        setSelectedMonth(value);
        // Gọi lại API với tháng mới
    };

    return (
        <div style={{ width: "100%", height: 250 }}>
            <Row gutter={16} style={{ marginBottom: 16 }} >
                <Col>
                    <h3>Materials in Store</h3>
                </Col>
                <Col>
                    <Select
                        defaultValue={selectedYear}
                        style={{ width: 120 }}
                        onChange={handleYearChange}
                        suffixIcon={<Icons.calendar />}
                    >
                        <Option value={2022}>2022</Option>
                        <Option value={2023}>2023</Option>
                        <Option value={2024}>2024</Option>
                    </Select>
                </Col>
                <Col>
                    <Select
                        defaultValue={selectedMonth}
                        style={{ width: 120 }}
                        onChange={handleMonthChange}
                        suffixIcon={<Icons.calendar />}
                    >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                            <Option key={month} value={month}>
                                Tháng {month}
                            </Option>
                        ))}
                    </Select>
                </Col>
            </Row>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="plantName" />
                    <YAxis label={{ value: "Kg", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    {productTypes.map((type, index) => (
                        <Area
                            key={index}
                            type="monotone"
                            dataKey={type}
                            stackId="1"
                            stroke={`#${Math.floor(Math.random() * 16777215).toString(16)}`}
                            fill={`#${Math.floor(Math.random() * 16777215).toString(16)}`}
                        />
                    ))}
                </AreaChart>

            </ResponsiveContainer>
        </div>
    );
};

export default SynchronizedAreaChart;