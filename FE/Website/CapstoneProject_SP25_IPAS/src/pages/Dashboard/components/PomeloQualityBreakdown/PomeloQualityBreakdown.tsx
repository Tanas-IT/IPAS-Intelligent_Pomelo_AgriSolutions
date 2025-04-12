import React, { useState, useEffect } from "react";
import { Collapse, Empty, Flex, Progress, Select } from "antd";
import { dashboardService } from "@/services";
import { Loading } from "@/components";
import { PomeloQualityBreakdownResponse } from "@/payloads/dashboard";

const { Option } = Select;
const { Panel } = Collapse;

const PomeloQualityBreakdown: React.FC = () => {
    const [data, setData] = useState<PomeloQualityBreakdownResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState<number>(2024);

    const years = Array.from({ length: 6 }, (_, i) => 2020 + i);

    const fetchPomeloQualityData = async (year: number) => {
        try {
            const qualityData = await dashboardService.getPomeloQualityBreakdown(year);
            if (qualityData.data) {

                setData(qualityData.data);
                setLoading(false);
            } else {
                setData([]);
                setLoading(false);
            }
        } catch (error) {
            console.error("Error fetching pomelo quality breakdown data:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPomeloQualityData(selectedYear);
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
            {data.length > 0 ? (
                <Collapse
                    accordion
                    style={{
                        background: 'white',
                        border: '1px solid #bcd379',
                        borderRadius: '4px'
                    }}
                    expandIconPosition="right"
                    expandIcon={({ isActive }) => (
                        <span style={{ color: '#bcd379' }}>
                            {isActive ? '▼' : '►'}
                        </span>
                    )}
                >
                    {data.map((item) => (
                        <Panel header={item.harvestSeason} key={item.harvestSeason}>
                            {item.qualityStats.map((stat) => (
                                <div key={stat.qualityType} style={styles.progressItem}>
                                    <span style={styles.qualityType}>{stat.qualityType}</span>
                                    <Progress
                                        percent={stat.percentage}
                                        status={stat.percentage === 0 ? "exception" : "normal"}
                                        strokeColor={getStrokeColor(stat.qualityType)}
                                        format={(percent) => `${percent?.toFixed(2)}%`}
                                    />
                                </div>
                            ))}
                        </Panel>
                    ))}
                </Collapse>
            ) : (
                <Flex justify="center" align="center" style={{ width: "100%" }}>
                    <Empty description="No data available" />
                </Flex>
            )}


        </div>
    );
};

const getStrokeColor = (qualityType: string) => {
    switch (qualityType.toLowerCase()) {
        case "grade 2":
            return "#82ca9d";
        case "grade 3":
            return "#ffc658";
        case "leaves":
            return "#a4de6c";
        case "branches":
            return "#ff7300";
        default:
            return "#1890ff";
    }
};

const styles = {
    container: {
        padding: "20px",
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        border: "1px solid #ccc",
        borderRadius: "8px",
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
    progressItem: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "10px",
    },
    qualityType: {
        whiteSpace: "nowrap",
        marginRight: "15px",
    }
};

export default PomeloQualityBreakdown;