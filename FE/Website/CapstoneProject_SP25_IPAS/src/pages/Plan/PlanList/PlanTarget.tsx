import React, { useState } from 'react';
import { Form, Select, Row, Col, Button, Table } from 'antd';
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
    const [form] = Form.useForm();
    

    const handleUnitChange = (value: string, index: number) => {
        console.log("value, index", value, index);
        
      const newSelectedUnits = [...selectedUnits];
      newSelectedUnits[index] = value;
      setSelectedUnits(newSelectedUnits);
    };

    const handleLandPlotChangee = (value: number, index: number) => {
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

    const handleLandRowChange = (value: number, index: number) => {
        onLandRowChange(value);
        form.setFieldsValue({
          planTargetModel: {
            [index]: {
              plantID: undefined,
            },
          },
        });
      };
  
    const renderFields = (unit: string, name: number) => {
      switch (unit) {
        case 'landPlot':
          return (
            <Col span={6}>
              <Form.Item
                name={[name, 'landPlotID']}
                label="Land Plot"
                rules={[{ required: true, message: 'Please select a land plot!' }]}
              >
                <Select placeholder="Select Land Plot" onChange={(value) => handleLandPlotChangee(value, name)}>
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
                  <Select placeholder="Select Land Plot" onChange={(value) => handleLandPlotChangee(value, name)}>
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
                  <Select placeholder="Select Land Row" onChange={(value) => handleLandRowChange(value, name)}>
                    {landRows.map((row) => (
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
                  <Select placeholder="Select Land Plot" onChange={(value) => handleLandPlotChangee(value, name)}>
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
                  <Select placeholder="Select Land Row" onChange={(value) => handleLandRowChange(value, name)}>
                    {landRows.map((row) => (
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
                  <Select placeholder="Select Plant">
                    {plants.map((plant) => (
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
                <Select placeholder="Select Plant Lot">
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
                <Select placeholder="Select Grafted Plant">
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