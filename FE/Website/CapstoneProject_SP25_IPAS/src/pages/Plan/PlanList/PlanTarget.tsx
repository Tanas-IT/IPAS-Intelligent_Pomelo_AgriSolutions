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

interface SelectedTargets {
    unit: string;
    landPlots: OptionType[];
    landRows: OptionType[];
    plants: OptionType[];
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
    const [selectedTargets, setSelectedTargets] = useState<SelectedTargets>({
        unit: "",
        landPlots: [],
        landRows: [],
        plants: [],
        plantLots: [],
        graftedPlants: [],
    });

    // Gọi API khi unit hoặc selectedGrowthStage thay đổi
    useEffect(() => {
        if (selectedTargets.unit && selectedGrowthStage) {
            planService
                .filterTargetByUnitGrowthStage(selectedTargets.unit, selectedGrowthStage, Number(getFarmId()))
                .then((response) => {
                    console.log("Filtered Data: ", response);
                    setSelectedTargets((prev) => ({ ...prev, ...response.data }));
                })
                .catch((error) => {
                    console.error('Error fetching data:', error);
                    message.error('Failed to fetch data. Please try again.');
                });
        }
    }, [selectedTargets.unit, selectedGrowthStage]);

    // Xử lý khi người dùng chọn Unit
    const handleUnitChange = async (value: string, index: number) => {
        setSelectedTargets((prev) => ({ ...prev, unit: value }));

        // Kiểm tra nếu growth stage chưa được chọn
        if (!selectedGrowthStage) {
            message.warning('Please select a growth stage first.');
            return;
        }

        // Gọi API để lấy dữ liệu phù hợp
        try {
            const response = await planService.filterTargetByUnitGrowthStage(value, selectedGrowthStage, Number(getFarmId()));
            console.log("Filtered Data: ", response);

            // Cập nhật state dựa trên unit được chọn
            setSelectedTargets((prev) => ({
                ...prev,
                landPlots: value === 'landPlot' ? response.data : prev.landPlots,
                landRows: value === 'row' ? response.data : prev.landRows,
                plants: value === 'plant' ? response.data : prev.plants,
                plantLots: value === 'plantLot' ? response.data : prev.plantLots,
                graftedPlants: value === 'graftedPlant' ? response.data : prev.graftedPlants,
            }));
        } catch (error) {
            console.error('Error fetching data:', error);
            message.error('Failed to fetch data. Please try again.');
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

    // Render các trường dựa trên unit được chọn
    const renderFields = (unit: string, name: number) => {
        const selectedLandPlot = selectedLandPlots[name];
        const selectedLandRow = selectedLandRows[name];

        switch (unit) {
            case 'landPlot':
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
                                {selectedTargets.landPlots.map((plot) => (
                                    <Option key={plot.value} value={plot.value}>
                                        {plot.label}
                                    </Option>
                                ))}
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
                                    {selectedTargets.landPlots.map((plot) => (
                                        <Option key={plot.value} value={plot.value}>
                                            {plot.label}
                                        </Option>
                                    ))}
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
                                    {selectedTargets.landRows.map((row) => (
                                        <Option key={row.value} value={row.value}>
                                            {row.label}
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
                                    {selectedTargets.landPlots.map((plot) => (
                                        <Option key={plot.value} value={plot.value}>
                                            {plot.label}
                                        </Option>
                                    ))}
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
                                    {selectedTargets.landRows.map((row) => (
                                        <Option key={row.value} value={row.value}>
                                            {row.label}
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
                                    {selectedTargets.plants.map((plant) => (
                                        <Option key={plant.value} value={plant.value}>
                                            {plant.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </>
                );
            case 'plantLot':
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
                                {selectedTargets.plantLots.map((lot) => (
                                    <Option key={lot.value} value={lot.value}>
                                        {lot.label}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                );
            case 'graftedPlant':
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
                                {selectedTargets.graftedPlants.map((grafted) => (
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

        return values.map((target, index: number) => {
            const unit = selectedUnits[index];
            let details = '';

            switch (unit) {
                case 'landPlot':
                    details = `Land Plot: ${selectedTargets.landPlots.find((plot) => plot.value === target.landPlotID)?.label}`;
                    break;
                case 'row':
                    details = `Land Plot: ${selectedTargets.landPlots.find((plot) => plot.value === target.landPlotID)?.label}, Land Row: ${selectedTargets.landRows.find((row) => row.value === target.landRowID)?.label}`;
                    break;
                case 'plant':
                    details = `Land Plot: ${selectedTargets.landPlots.find((plot) => plot.value === target.landPlotID)?.label}, Land Row: ${selectedTargets.landRows.find((row) => row.value === target.landRowID)?.label}, Plant: ${selectedTargets.plants.find((plant) => plant.value === target.plantID)?.label}`;
                    break;
                case 'plantLot':
                    details = `Plant Lot: ${selectedTargets.plantLots.find((lot) => lot.value === target.plantLotID)?.label}`;
                    break;
                case 'graftedPlant':
                    details = `Grafted Plant: ${selectedTargets.graftedPlants.find((grafted) => grafted.value === target.graftedPlantID)?.label}`;
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
                                            <Option value="landPlot">Land Plot</Option>
                                            <Option value="row">Row</Option>
                                            <Option value="plant">Plant</Option>
                                            <Option value="plantLot">Plant Lot</Option>
                                            <Option value="graftedPlant">Grafted Plant</Option>
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