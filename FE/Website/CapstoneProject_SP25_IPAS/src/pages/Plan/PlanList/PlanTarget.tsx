import React, { useEffect, useState } from 'react';
import { Form, Select, Row, Col, Button, Table, message } from 'antd';
import { Section } from '@/components';
import { Icons } from '@/assets';
import { planService } from '@/services';
import { getFarmId } from '@/utils';

const { Option } = Select;

type OptionType<T = string | number> = { value: T; label: string };

interface PlanTargetProps {
    landPlotOptions: OptionType[];
    landRows: OptionType[];
    plants: OptionType[];
    plantLots: OptionType[];
    graftedPlants: OptionType[];
    selectedGrowthStage: number[]; // Nhận selectedGrowthStage từ props
    onLandPlotChange: (landPlotId: number) => void;
    onLandRowChange: (landPlotId: number) => void;
}

interface PlantOption {
    plantId: number;
    plantName: string;
}

interface RowOption {
    landRowId: number;
    rowIndex: number;
    plants: PlantOption[];
}

interface SelectedTargets {
    unit: string;
    landPlotId: number;
    landPlotName: string;
    rows: RowOption[];
    plants: PlantOption[];
    plantLots: OptionType[];
    graftedPlants: OptionType[];
}

const PlanTarget = ({
    landPlotOptions,
    landRows,
    plants,
    plantLots,
    graftedPlants,
    selectedGrowthStage,
    onLandPlotChange,
    onLandRowChange,
}: PlanTargetProps) => {
    const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
    const [selectedLandPlots, setSelectedLandPlots] = useState<number[]>([]);
    const [selectedLandRows, setSelectedLandRows] = useState<number[][]>([]);
    const [selectedPlants, setSelectedPlants] = useState<number[][]>([]);
    const [selectedPlantLots, setSelectedPlantLots] = useState<number[][]>([]);
    const [selectedGraftedPlants, setSelectedGraftedPlants] = useState<number[][]>([]);
    const [form] = Form.useForm();
    const [selectedTargets, setSelectedTargets] = useState<SelectedTargets[]>([]);

    useEffect(() => {
        if (selectedTargets.length > 0 && selectedGrowthStage) {
            const currentUnit = selectedTargets[selectedTargets.length - 1].unit;
            if (!currentUnit) return;

            planService
                .filterTargetByUnitGrowthStage(currentUnit, selectedGrowthStage, Number(getFarmId()))
                .then((response) => {
                    console.log("Filtered Data: ", response);

                    const formattedData = response.map((item) => ({
                        unit: currentUnit,
                        landPlotId: item.landPlotId,
                        landPlotName: item.landPlotName,
                        rows: currentUnit === "row" ? item.rows.map(row => ({
                            landRowId: row.landRowId,
                            rowIndex: row.rowIndex,
                            plants: row.plants.map(plant => ({
                                plantId: plant.plantId,
                                plantName: plant.plantName
                            }))
                        })) : [],
                        plants: currentUnit === "plant" ? item.plants : [],
                        plantLots: currentUnit === "plantLot" ? item.plantLots : [],
                        graftedPlants: currentUnit === "graftedPlant" ? item.graftedPlants : [],
                    }));

                    setSelectedTargets((prev) => [...prev, ...formattedData]);
                })
                .catch((error) => {
                    console.error("Error fetching data:", error);
                    message.error("Failed to fetch data. Please try again.");
                });
        }
    }, [selectedGrowthStage]);

    const handleUnitChange = async (value: string, index: number) => {
        if (!selectedGrowthStage) {
            message.warning("Please select a growth stage first.");
            return;
        }

        try {
            const response = await planService.filterTargetByUnitGrowthStage(value, selectedGrowthStage, Number(getFarmId()));
            console.log("Filtered Data: ", response);

            const formattedData = response.map((item) => ({
                unit: value,
                landPlotId: item.landPlotId,
                landPlotName: item.landPlotName,
                rows: value === "row" || value === "plant"
                    ? item.rows.map(row => ({
                        landRowId: row.landRowId,
                        rowIndex: row.rowIndex,
                        plants: row.plants.map(plant => ({
                            plantId: plant.plantId,
                            plantName: plant.plantName
                        }))
                    }))
                    : [],
                plants: value === "plant" ? item.plants : [],
                plantLots: value === "plantLot" ? item.plantLots : [],
                graftedPlants: value === "graftedPlant" ? item.graftedPlants : [],
            }));

            // Cập nhật state, giữ nguyên dữ liệu cũ
            setSelectedTargets((prev) => {
                const newSelectedTargets = [...prev];
                newSelectedTargets[index] = formattedData[0]; // Lấy phần tử đầu tiên (vì API trả về mảng)
                return newSelectedTargets;
            });

            setSelectedUnits((prev) => {
                const newSelectedUnits = [...prev];
                newSelectedUnits[index] = value; // Cập nhật unit tại vị trí index
                return newSelectedUnits;
            });
        } catch (error) {
            console.error("Error fetching data:", error);
            message.error("Failed to fetch data. Please try again.");
        }
    };


    // Xử lý khi người dùng chọn Land Plot
    const handleLandPlotChange = (value: number, index: number) => {
        setSelectedLandPlots((prev) => {
            const newSelectedLandPlots = [...prev];
            newSelectedLandPlots[index] = value;
            return newSelectedLandPlots;
        });
        onLandPlotChange(value);
    };

    // Xử lý khi người dùng chọn Land Row
    const handleLandRowChange = (value: number[], index: number) => {
        setSelectedLandRows((prev) => {
            const newSelectedLandRows = [...prev];
            newSelectedLandRows[index] = value;
            return newSelectedLandRows;
        });
        onLandRowChange(value[0]); // Gửi giá trị đầu tiên (nếu cần)
    };

    // Xử lý khi người dùng chọn Plant
    const handlePlantChange = (value: number[], index: number) => {
        setSelectedPlants((prev) => {
            const newSelectedPlants = [...prev];
            newSelectedPlants[index] = value;
            return newSelectedPlants;
        });
    };

    // Xử lý khi người dùng chọn Plant Lot
    const handlePlantLotChange = (value: number[], index: number) => {
        setSelectedPlantLots((prev) => {
            const newSelectedPlantLots = [...prev];
            newSelectedPlantLots[index] = value;
            return newSelectedPlantLots;
        });
    };

    // Xử lý khi người dùng chọn Grafted Plant
    const handleGraftedPlantChange = (value: number[], index: number) => {
        setSelectedGraftedPlants((prev) => {
            const newSelectedGraftedPlants = [...prev];
            newSelectedGraftedPlants[index] = value;
            return newSelectedGraftedPlants;
        });
    };
    console.log("selectedTargets", selectedTargets);


    // Render các trường dựa trên unit được chọn
    const renderFields = (unit: string, name: number) => {
        const selectedTarget = selectedTargets[name];
        console.log("render unit", unit);


        switch (unit) {
            case 'landplot':
                return (
                    <Col span={6}>
                        <Form.Item
                            name={[name, 'landPlotID']}
                            label="Land Plot"
                            rules={[{ required: true, message: 'Please select a land plot!' }]}
                        >
                            <Select
                                placeholder="Select Land Plot"
                                onChange={(value) => handleLandPlotChange(value, name)}
                            >
                                {selectedTarget && (
                                    <Option key={selectedTarget.landPlotId} value={selectedTarget.landPlotId}>
                                        {selectedTarget.landPlotName}
                                    </Option>
                                )}
                            </Select>
                        </Form.Item>
                    </Col>
                );
            case 'row':
                return (
                    <>
                        <Col span={6}>
                            <Form.Item
                                name={[name, 'landPlotID']}
                                label="Land Plot"
                                rules={[{ required: true, message: 'Please select a land plot!' }]}
                            >
                                <Select
                                    placeholder="Select Land Plot"
                                    onChange={(value) => handleLandPlotChange(value, name)}
                                >
                                    {selectedTarget && (
                                        <Option key={selectedTarget.landPlotId} value={selectedTarget.landPlotId}>
                                            {selectedTarget.landPlotName}
                                        </Option>
                                    )}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                name={[name, 'landRowID']}
                                label="Land Row"
                                rules={[{ required: true, message: 'Please select a land row!' }]}
                            >
                                <Select
                                    mode="multiple"
                                    placeholder="Select Land Row"
                                    onChange={(value) => handleLandRowChange(value, name)}
                                >
                                    {selectedTarget?.rows.map((row) => (
                                        <Option key={row.landRowId} value={row.landRowId}>
                                            {`Row ${row.rowIndex}`}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </>
                );
            case 'plant':
                return (
                    <>
                        <Col span={6}>
                            <Form.Item
                                name={[name, 'landPlotID']}
                                label="Land Plot"
                                rules={[{ required: true, message: 'Please select a land plot!' }]}
                            >
                                <Select
                                    placeholder="Select Land Plot"
                                    onChange={(value) => handleLandPlotChange(value, name)}
                                >
                                    {selectedTarget && (
                                        <Option key={selectedTarget.landPlotId} value={selectedTarget.landPlotId}>
                                            {selectedTarget.landPlotName}
                                        </Option>
                                    )}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                name={[name, 'landRowID']}
                                label="Land Row"
                                rules={[{ required: true, message: 'Please select a land row!' }]}
                            >
                                <Select
                                    mode="multiple"
                                    placeholder="Select Land Row"
                                    onChange={(value) => handleLandRowChange(value, name)}
                                >
                                    {selectedTarget?.rows.map((row) => (
                                        <Option key={row.landRowId} value={row.landRowId}>
                                            {`Row ${row.rowIndex}`}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                name={[name, 'plantID']}
                                label="Plant"
                                rules={[{ required: true, message: 'Please select a plant!' }]}
                            >
                                <Select
                                    mode="multiple"
                                    placeholder="Select Plant"
                                    onChange={(value) => handlePlantChange(value, name)}
                                >
                                    {selectedTarget?.plants.map((plant) => (
                                        <Option key={plant.plantId} value={plant.plantId}>
                                            {plant.plantName}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </>
                );
            case 'plantlot':
                return (
                    <Col span={6}>
                        <Form.Item
                            name={[name, 'plantLotID']}
                            label="Plant Lot"
                            rules={[{ required: true, message: 'Please select a plant lot!' }]}
                        >
                            <Select
                                mode="multiple"
                                placeholder="Select Plant Lot"
                                onChange={(value) => handlePlantLotChange(value, name)}
                            >
                                {selectedTarget?.plantLots.map((lot) => (
                                    <Option key={lot.value} value={lot.value}>
                                        {lot.label}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                );
            case 'graftedplant':
                return (
                    <Col span={6}>
                        <Form.Item
                            name={[name, 'graftedPlantID']}
                            label="Grafted Plant"
                            rules={[{ required: true, message: 'Please select a grafted plant!' }]}
                        >
                            <Select
                                mode="multiple"
                                placeholder="Select Grafted Plant"
                                onChange={(value) => handleGraftedPlantChange(value, name)}
                            >
                                {selectedTarget?.graftedPlants.map((grafted) => (
                                    <Option key={grafted.value} value={grafted.value}>
                                        {grafted.label}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                );
            default:
                return null;
        }
    };

    // Lấy dữ liệu summary để hiển thị trong bảng
    const getSummaryData = () => {
        const values = form.getFieldsValue().planTargetModel || [];

        return values.map((target: any, index: number) => {
            const unit = selectedUnits[index];
            const selectedTarget = selectedTargets[index];
            let details = '';

            switch (unit) {
                case 'landPlot':
                    details = `Land Plot: ${selectedTarget?.landPlotName}`;
                    break;
                case 'row':
                    details = `Land Plot: ${selectedTarget?.landPlotName}, Land Row: ${selectedTarget?.rows
                        .map((row) => `Row ${row.rowIndex}`)
                        .join(", ")}`;
                    break;
                case 'plant':
                    details = `Land Plot: ${selectedTarget?.landPlotName}, Land Row: ${selectedTarget?.rows
                        .map((row) => `Row ${row.rowIndex}`)
                        .join(", ")}, Plant: ${selectedTarget?.plants
                            .map((plant) => plant.plantName)
                            .join(", ")}`;
                    break;
                case 'plantLot':
                    details = `Plant Lot: ${selectedTarget?.plantLots
                        .map((lot) => lot.label)
                        .join(", ")}`;
                    break;
                case 'graftedPlant':
                    details = `Grafted Plant: ${selectedTarget?.graftedPlants
                        .map((grafted) => grafted.label)
                        .join(", ")}`;
                    break;
                default:
                    details = 'No selection';
            }

            return {
                key: index,
                unit: unit,
                details: details,
            };
        });
    };

    const summaryColumns = [
        {
            title: 'Unit',
            dataIndex: 'unit',
            key: 'unit',
        },
        {
            title: 'Details',
            dataIndex: 'details',
            key: 'details',
        },
    ];

    console.log("selectedUnits", selectedUnits);


    return (
        <Section title="Plan Targets" subtitle="Define the targets for the care plan.">
            <Form.List name="planTargetModel">
                {(fields, { add, remove }) => (
                    <>
                        {fields.map(({ key, name, ...restField }) => (
                            <Row key={key} gutter={16} align="middle">
                                <Col span={6}>
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'unit']}
                                        label="Unit"
                                        rules={[{ required: true, message: 'Please select a unit!' }]}
                                    >
                                        <Select
                                            placeholder="Select Unit"
                                            onChange={(value) => handleUnitChange(value, name)}
                                        >
                                            <Option value="landplot">Land Plot</Option>
                                            <Option value="row">Row</Option>
                                            <Option value="plant">Plant</Option>
                                            <Option value="plantlot">Plant Lot</Option>
                                            <Option value="graftedplant">Grafted Plant</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                {renderFields(selectedUnits[name], name)}
                                <Col span={2}>
                                    <Button type="link" danger onClick={() => remove(name)}>
                                        <Icons.delete />
                                    </Button>
                                </Col>
                            </Row>
                        ))}
                        <Form.Item>
                            <Button type="dashed" onClick={() => add()} block>
                                Add Target
                            </Button>
                        </Form.Item>
                    </>
                )}
            </Form.List>
            <div style={{ marginTop: 24 }}>
                <h3>Summary of Selected Targets</h3>
                <Table
                    columns={summaryColumns}
                    dataSource={getSummaryData()}
                    pagination={false}
                    bordered
                />
            </div>
        </Section>
    );
};

export default PlanTarget;