import React, { useEffect, useState } from 'react';
import { Form, Select, Row, Col, Button, message, Modal, Alert } from 'antd';
import { Section } from '@/components';
import { Icons } from '@/assets';
import { planService } from '@/services';
import { determineUnit, fetchTargetsByUnit, getFarmId, isTargetOverlapping, unitOptions } from '@/utils';
import { PlanTargetModel, SelectedTarget } from '@/payloads';

const { Option } = Select;

type OptionType<T = string | number> = { value: T; label: string };

interface UpdatePlanTargetProps {
    form: any;
    landPlotOptions: OptionType[];
    landRows: OptionType[];
    plants: OptionType[];
    plantLots: OptionType[];
    graftedPlants: OptionType[];
    selectedGrowthStage: number[];
    onLandPlotChange?: (landPlotId: number) => void;
    onLandRowChange?: (landPlotId: number) => void;
    initialValues?: PlanTargetModel[];
    onChange?: (targets: SelectedTarget[][]) => void;
    hasSelectedCrop: boolean;
    onClearTargets: () => void;
}

const UpdatePlanTarget = ({
    form,
    landPlotOptions,
    landRows,
    plants,
    plantLots,
    graftedPlants,
    selectedGrowthStage,
    initialValues = [],
    onChange,
    hasSelectedCrop,
    onClearTargets,
}: UpdatePlanTargetProps) => {
    const [, forceUpdate] = useState({});
    const [selectedUnits, setSelectedUnits] = useState<(string | undefined)[]>([]);
    const [selectedLandPlots, setSelectedLandPlots] = useState<(number | undefined)[]>([]);
    const [selectedLandRows, setSelectedLandRows] = useState<number[][]>([]);
    const [selectedPlants, setSelectedPlants] = useState<number[][]>([]);
    const [selectedPlantLots, setSelectedPlantLots] = useState<number[][]>([]);
    const [selectedGraftedPlants, setSelectedGraftedPlants] = useState<number[][]>([]);
    const [selectedTargets, setSelectedTargets] = useState<SelectedTarget[][]>([]);

    useEffect(() => {
            if (hasSelectedCrop) {
              onClearTargets();
            }
          }, [hasSelectedCrop, onClearTargets]);

    useEffect(() => {
        if (initialValues.length > 0) {
            const formattedValues = initialValues.map((target) => {
                const unit = determineUnit(target);
                return {
                    unit,
                    landPlotId: target.landPlotId,
                    landPlotName: target.landPlotName,
                    rows: target.rows || [],
                    plants: target.plants || [],
                    plantLots: target.plantLots || [],
                    graftedPlants: target.graftedPlants || [],
                };
            });

            setSelectedTargets([formattedValues]);

            // Khởi tạo form values
            form.setFieldsValue({
                planTargetModel: formattedValues.map((target) => ({
                    unit: target.unit,
                    landPlotID: target.landPlotId,
                    landRowID: target.rows.map((row) => row.landRowId),
                    plantID: target.plants.map((plant) => plant.plantId),
                    plantLotID: target.plantLots.map((lot) => lot.plantLotId),
                    graftedPlantID: target.graftedPlants.map((grafted) => grafted.graftedPlantId),
                })),
            });

            // Khởi tạo các state khác
            setSelectedUnits(formattedValues.map((target) => target.unit));
            setSelectedLandPlots(formattedValues.map((target) => target.landPlotId));
            setSelectedLandRows(formattedValues.map((target) => target.rows.map((row) => row.landRowId)));
            setSelectedPlants(formattedValues.map((target) => target.plants.map((plant) => plant.plantId)));
            setSelectedPlantLots(formattedValues.map((target) => target.plantLots.map((lot) => lot.plantLotId)));
            setSelectedGraftedPlants(formattedValues.map((target) => target.graftedPlants.map((grafted) => grafted.graftedPlantId)));
        }
    }, [initialValues, form]);

    const showModal = (title: string, content: string, onOk: () => void) => {
        Modal.confirm({
            title,
            content,
            onOk,
            onCancel: () => message.info("Cancel action!"),
        });
    };

    const handleUnitChange = async (value: string, index: number) => {
        if (!selectedGrowthStage) {
            message.warning("Please select a growth stage first.");
            return;
        }

        if (value === "graftedplant" || value === "plantlot") {
            const isUnitAlreadySelected = selectedUnits.some((unit, i) => i !== index && unit === value);
            if (isUnitAlreadySelected) {
                showModal(
                    "Warning",
                    `You have already selected ${value} before. Please choose the same as the existing target.`,
                    () => { }
                );
                return;
            }
        }

        try {
            await fetchTargetsByUnit(value, selectedGrowthStage, index, setSelectedTargets);
            setSelectedUnits((prev) => {
                const newSelectedUnits = [...prev];
                newSelectedUnits[index] = value;
                return newSelectedUnits;
            });

        } catch (error) {
            console.error("Error fetching data:", error);
            message.error("Failed to fetch data. Please try again.");
        }
    };

    const handleLandPlotChange = (value: number, index: number) => {
        const currentUnit = selectedUnits[index];
        if (isTargetOverlapping(
            index,
            value,
            selectedLandRows[index],
            selectedPlants[index],
            currentUnit,
            selectedUnits,
            selectedLandPlots,
            selectedLandRows,
            selectedPlants
        )) {
            showModal(
                "Warning",
                "You have selected a target that overlaps with or is contained within a previously chosen target. Please select in the existing target.",
                () => {
                    setSelectedLandPlots((prev) => {
                        const newSelectedLandPlots = [...prev];
                        newSelectedLandPlots[index] = undefined;
                        return newSelectedLandPlots;
                    });
                    form.setFieldsValue({
                        planTargetModel: {
                            [index]: {
                                landPlotID: undefined,
                            },
                        },
                    });
                    forceUpdate({});
                }
            );
            return;
        }

        setSelectedLandPlots((prev) => {
            const newSelectedLandPlots = [...prev];
            newSelectedLandPlots[index] = value;
            return newSelectedLandPlots;
        });
    };

    const handleLandRowChange = (value: number | number[], index: number) => {
        const currentUnit = selectedUnits[index];
        if (isTargetOverlapping(
            index,
            selectedLandPlots[index],
            value,
            selectedPlants[index],
            currentUnit,
            selectedUnits,
            selectedLandPlots,
            selectedLandRows,
            selectedPlants
        )) {
            showModal(
                "Warning",
                "You have selected a target that overlaps with or is contained within a previously chosen target. Please select in the existing target.",
                () => {
                    setSelectedLandRows((prev) => {
                        const newSelectedLandRows = [...prev];
                        newSelectedLandRows[index] = [];
                        return newSelectedLandRows;
                    });

                    form.setFieldsValue({
                        planTargetModel: {
                            [index]: {
                                landRowID: undefined,
                            },
                        },
                    });

                    forceUpdate({});
                }
            );
            return;
        }

        if (selectedUnits[index] === "row") {
            setSelectedLandRows((prev) => {
                const newSelectedLandRows = [...prev];
                newSelectedLandRows[index] = value as number[];
                return newSelectedLandRows;
            });
        } else {
            setSelectedLandRows((prev) => {
                const newSelectedLandRows = [...prev];
                newSelectedLandRows[index] = [value as number];
                return newSelectedLandRows;
            });
        }
    };

    const handlePlantChange = (value: number[], index: number) => {
        const currentUnit = selectedUnits[index];
        if (isTargetOverlapping(
            index,
            selectedLandPlots[index],
            value,
            selectedPlants[index],
            currentUnit,
            selectedUnits,
            selectedLandPlots,
            selectedLandRows,
            selectedPlants
        )) {
            showModal(
                "Warning",
                "You have selected a target that overlaps with or is contained within a previously chosen target. Please select in the existing target.",
                () => {
                    setSelectedPlants((prev) => {
                        const newSelectedPlants = [...prev];
                        newSelectedPlants[index] = [];
                        return newSelectedPlants;
                    });

                    form.setFieldsValue({
                        planTargetModel: {
                            [index]: {
                                plantID: undefined,
                            },
                        },
                    });

                    forceUpdate({});
                }
            );
            return;
        }

        setSelectedPlants((prev) => {
            const newSelectedPlants = [...prev];
            newSelectedPlants[index] = value;
            return newSelectedPlants;
        });
    };

    const handlePlantLotChange = (value: number[], index: number) => {
        const currentUnit = selectedUnits[index];
        if (isTargetOverlapping(
            index,
            selectedLandPlots[index],
            value,
            selectedPlants[index],
            currentUnit,
            selectedUnits,
            selectedLandPlots,
            selectedLandRows,
            selectedPlants
        )) {
            showModal(
                "Warning",
                "You have selected a target that overlaps with or is contained within a previously chosen target. Please select in the existing target.",
                () => {
                    setSelectedPlantLots((prev) => {
                        const newSelectedPlantLots = [...prev];
                        newSelectedPlantLots[index] = [];
                        return newSelectedPlantLots;
                    });

                    form.setFieldsValue({
                        planTargetModel: {
                            [index]: {
                                plantLotID: undefined,
                            },
                        },
                    });
                    forceUpdate({});
                }
            );
            return;
        }
        setSelectedPlantLots((prev) => {
            const newSelectedPlantLots = [...prev];
            newSelectedPlantLots[index] = value;
            return newSelectedPlantLots;
        });
    };

    const handleGraftedPlantChange = (value: number[], index: number) => {
        const currentUnit = selectedUnits[index];
        if (isTargetOverlapping(
            index,
            selectedLandPlots[index],
            value,
            selectedPlants[index],
            currentUnit,
            selectedUnits,
            selectedLandPlots,
            selectedLandRows,
            selectedPlants
        )) {
            showModal(
                "Warning",
                "You have selected a target that overlaps with or is contained within a previously chosen target. Please select in the existing target.",
                () => {
                    setSelectedGraftedPlants((prev) => {
                        const newSelectedGraftedPlants = [...prev];
                        newSelectedGraftedPlants[index] = [];
                        return newSelectedGraftedPlants;
                    });

                    form.setFieldsValue({
                        planTargetModel: {
                            [index]: {
                                graftedPlantID: undefined,
                            },
                        },
                    });

                    forceUpdate({});
                }
            );
            return;
        }

        setSelectedGraftedPlants((prev) => {
            const newSelectedGraftedPlants = [...prev];
            newSelectedGraftedPlants[index] = value;
            return newSelectedGraftedPlants;
        });
    };

    const renderFields = (unit: string, index: number) => {
        const selectedTarget = selectedTargets[index]?.[0];
        const selectedLandPlot = selectedLandPlots[index];
        const selectedLandRow = selectedLandRows[index];
        const selectedPlant = selectedPlants[index];
        const selectedPlantLot = selectedPlantLots[index];
        const selectedGraftedPlant = selectedGraftedPlants[index];

        const isUnitDisabled = (unit === "graftedplant" || unit === "plantlot") &&
            selectedUnits.some((u, i) => i !== index && u === unit);

        if (isUnitDisabled) {
            return (
                <Col span={6}>
                    <Alert
                        message={`You have already selected ${unit} before. Please choose the same as the existing target.`}
                        type="warning"
                        showIcon
                    />
                </Col>
            );
        }

        switch (unit) {
            case 'landplot':
                return (
                    <Col span={6}>
                        <Form.Item
                            name={[index, 'landPlotID']}
                            label="Land Plot"
                            rules={[{ required: true, message: 'Please select a land plot!' }]}
                        >
                            <Select
                                placeholder="Select Land Plot"
                                onChange={(value) => handleLandPlotChange(value, index)}
                                value={selectedLandPlot}
                            >
                                {landPlotOptions.map((option) => (
                                    <Option key={option.value} value={option.value}>
                                        {option.label}
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
                                name={[index, 'landPlotID']}
                                label="Land Plot"
                                rules={[{ required: true, message: 'Please select a land plot!' }]}
                            >
                                <Select
                                    placeholder="Select Land Plot"
                                    onChange={(value) => handleLandPlotChange(value, index)}
                                    value={selectedLandPlot}
                                >
                                    {landPlotOptions.map((option) => (
                                        <Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                name={[index, 'landRowID']}
                                label="Land Row"
                                rules={[{ required: true, message: 'Please select a land row!' }]}
                            >
                                <Select
                                    placeholder="Select Land Row"
                                    mode={selectedUnits[index] === "row" ? "multiple" : undefined}
                                    onChange={(value) => handleLandRowChange(value, index)}
                                    value={selectedLandRow}
                                >
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
                                name={[index, 'landPlotID']}
                                label="Land Plot"
                                rules={[{ required: true, message: 'Please select a land plot!' }]}
                            >
                                <Select
                                    placeholder="Select Land Plot"
                                    onChange={(value) => handleLandPlotChange(value, index)}
                                    value={selectedLandPlot}
                                >
                                    {landPlotOptions.map((option) => (
                                        <Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                name={[index, 'landRowID']}
                                label="Land Row"
                                rules={[{ required: true, message: 'Please select a land row!' }]}
                            >
                                <Select
                                    placeholder="Select Land Row"
                                    mode={selectedUnits[index] === "row" ? "multiple" : undefined}
                                    onChange={(value) => handleLandRowChange(value, index)}
                                    value={selectedLandRow}
                                >
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
                                name={[index, 'plantID']}
                                label="Plant"
                                rules={[{ required: true, message: 'Please select a plant!' }]}
                            >
                                <Select
                                    mode="multiple"
                                    placeholder="Select Plant"
                                    onChange={(value) => handlePlantChange(value, index)}
                                    value={selectedPlant}
                                >
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
            case 'plantlot':
                return (
                    <Col span={6}>
                        <Form.Item
                            name={[index, 'plantLotID']}
                            label="Plant Lot"
                            rules={[{ required: true, message: 'Please select a plant lot!' }]}
                        >
                            <Select
                                mode="multiple"
                                placeholder="Select Plant Lot"
                                onChange={(value) => handlePlantLotChange(value, index)}
                                value={selectedPlantLot}
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
            case 'graftedplant':
                return (
                    <Col span={6}>
                        <Form.Item
                            name={[index, 'graftedPlantID']}
                            label="Grafted Plant"
                            rules={[{ required: true, message: 'Please select a grafted plant!' }]}
                        >
                            <Select
                                mode="multiple"
                                placeholder="Select Grafted Plant"
                                onChange={(value) => handleGraftedPlantChange(value, index)}
                                value={selectedGraftedPlant}
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

    return (
        <Section title="Plan Targets" subtitle="Define the targets for the care plan.">
            <Form.List name="planTargetModel">
                {(fields, { add, remove }) => {
                    console.log("fields", fields);
                    const handleAddField = () => {
                        const newIndex = fields.length;
                        add();
                        setSelectedUnits((prev) => [...prev, ""]);
                        setSelectedLandPlots((prev) => [...prev, 1]);
                        setSelectedLandRows((prev) => [...prev, []]);
                        setSelectedPlants((prev) => [...prev, []]);
                        setSelectedPlantLots((prev) => [...prev, []]);
                        setSelectedGraftedPlants((prev) => [...prev, []]);
                        setSelectedTargets((prev) => [...prev, []]);
                    };

                    return (
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
                                                {unitOptions.map((unit) => (
                                                    <Option key={unit.value} value={unit.value}>
                                                        {unit.label}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    {selectedUnits[name] && renderFields(selectedUnits[name], name)}
                                    <Col span={2}>
                                        <Button type="link" danger onClick={() => remove(name)}>
                                            <Icons.delete />
                                        </Button>
                                    </Col>
                                </Row>
                            ))}
                            <Form.Item>
                                <Button type="dashed" onClick={handleAddField} block disabled={hasSelectedCrop}>
                                    Add Target
                                </Button>
                            </Form.Item>
                        </>
                    );
                }}
            </Form.List>
        </Section>
    );
};

export default UpdatePlanTarget;