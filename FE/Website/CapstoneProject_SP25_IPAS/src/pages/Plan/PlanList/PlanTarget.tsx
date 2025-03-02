import React, { useState } from 'react';
import { Form, Select, Row, Col, Button, Table, message } from 'antd';
import { Section } from '@/components';
import { Icons } from '@/assets';

const { Option } = Select;

type OptionType<T = string | number> = { value: T; label: string };

interface PlanTargetProps {
    landPlotOptions: OptionType[];
    landRows: OptionType[];
    plants: OptionType[];
    plantLots: OptionType[];
    graftedPlants: OptionType[];
    onLandPlotChange: (landPlotId: number) => void;
    onLandRowChange: (landPlotId: number) => void;
}

const PlanTarget = ({ landPlotOptions, landRows, plants, plantLots, graftedPlants, onLandPlotChange, onLandRowChange }: PlanTargetProps) => {
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
    const [selectedLandPlots, setSelectedLandPlots] = useState<number[]>([]);
    const [selectedLandRows, setSelectedLandRows] = useState<number[][]>([]);
    const [selectedPlants, setSelectedPlants] = useState<number[][]>([]);
    const [selectedPlantLots, setSelectedPlantLots] = useState<number[][]>([]);
    const [selectedGraftedPlants, setSelectedGraftedPlants] = useState<number[][]>([]);
    const [form] = Form.useForm();

    const handleUnitChange = (value: string, index: number) => {
        const newSelectedUnits = [...selectedUnits];
        newSelectedUnits[index] = value;
        setSelectedUnits(newSelectedUnits);
    };

    const handleLandPlotChange = (value: number, index: number) => {
      // Kiểm tra xem landPlot này đã được chọn trong các target trước đó chưa
      const isDuplicate = selectedLandPlots.includes(value);
      if (isDuplicate) {
          message.warning('This land plot has already been selected in another target.');
          return;
      }

      const newSelectedLandPlots = [...selectedLandPlots];
      newSelectedLandPlots[index] = value;
      setSelectedLandPlots(newSelectedLandPlots);

      onLandPlotChange(value);
      form.setFieldsValue({
          planTargetModel: {
              [index]: {
                  landRowID: null,
                  plantID: undefined,
              },
          },
      });
  };

    const handleLandRowChange = (value: number[], index: number) => {
        const newSelectedLandRows = [...selectedLandRows];
        newSelectedLandRows[index] = value;
        setSelectedLandRows(newSelectedLandRows);

        onLandRowChange(value[0]); // Gửi giá trị đầu tiên (nếu cần)
    };

    const handlePlantChange = (value: number[], index: number) => {
        const newSelectedPlants = [...selectedPlants];
        newSelectedPlants[index] = value;
        setSelectedPlants(newSelectedPlants);
    };

    const handlePlantLotChange = (value: number[], index: number) => {
        const newSelectedPlantLots = [...selectedPlantLots];
        newSelectedPlantLots[index] = value;
        setSelectedPlantLots(newSelectedPlantLots);
    };

    const handleGraftedPlantChange = (value: number[], index: number) => {
        const newSelectedGraftedPlants = [...selectedGraftedPlants];
        newSelectedGraftedPlants[index] = value;
        setSelectedGraftedPlants(newSelectedGraftedPlants);
    };

    const getFilteredLandRows = (landPlotId: number) => {
        return landRows.filter(row => row.value === landPlotId);
    };

    const getFilteredPlants = (landRowId: number[]) => {
        return plants.filter(plant => landRowId.includes(plant.value));
    };

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
                                {landPlotOptions.map((plot) => (
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
                                    {landPlotOptions.map((plot) => (
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
                                    {getFilteredLandRows(selectedLandPlot).map((row) => (
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
                                    {landPlotOptions.map((plot) => (
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
                                    {getFilteredLandRows(selectedLandPlot).map((row) => (
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
                                    {getFilteredPlants(selectedLandRow).map((plant) => (
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
                                {plantLots.map((lot) => (
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
                                {graftedPlants.map((grafted) => (
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

    const getSummaryData = () => {
        const values = form.getFieldsValue().planTargetModel || [];

        return values.map((target, index: number) => {
            const unit = selectedUnits[index];
            let details = '';

            switch (unit) {
                case 'landPlot':
                    details = `Land Plot: ${landPlotOptions.find((plot) => plot.value === target.landPlotID)?.label}`;
                    break;
                case 'row':
                    details = `Land Plot: ${landPlotOptions.find((plot) => plot.value === target.landPlotID)?.label}, Land Row: ${landRows.find((row) => row.value === target.landRowID)?.label}`;
                    break;
                case 'plant':
                    details = `Land Plot: ${landPlotOptions.find((plot) => plot.value === target.landPlotID)?.label}, Land Row: ${landRows.find((row) => row.value === target.landRowID)?.label}, Plant: ${plants.find((plant) => plant.value === target.plantID)?.label}`;
                    break;
                case 'plantLot':
                    details = `Plant Lot: ${plantLots.find((lot) => lot.value === target.plantLotID)?.label}`;
                    break;
                case 'graftedPlant':
                    details = `Grafted Plant: ${graftedPlants.find((grafted) => grafted.value === target.graftedPlantID)?.label}`;
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