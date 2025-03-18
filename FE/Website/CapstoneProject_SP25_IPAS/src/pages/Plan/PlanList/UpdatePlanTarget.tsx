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
    // const [filteredTargets, setFilteredTargets] = useState<SelectedTarget[][]>([]);

    useEffect(() => {
        if (hasSelectedCrop) {
            onClearTargets();
        }
    }, [hasSelectedCrop, onClearTargets]);

    useEffect(() => {
        console.log("----------------------------------------", selectedTargets);
      }, [selectedTargets]);

    useEffect(() => {
        const fetchInitialData = async () => {
            if (initialValues.length > 0 && selectedGrowthStage) {
                const promises = initialValues.map(async (target, index) => {
                    const unit = determineUnit(target);
                    try {
                        await fetchTargetsByUnit(unit, selectedGrowthStage, index, setSelectedTargets);
                        
                        // setSelectedTargets((prev) => {
                        //     const newSelectedTargets = [...prev];
                        //     newSelectedTargets[index] = response.data;
                        //     return newSelectedTargets;
                        // });
                        console.log("jjsaedc", selectedTargets);
                        
                    } catch (error) {
                        console.error("Error fetching initial data:", error);
                        message.error("Failed to fetch initial data. Please try again.");
                    }
                });

                await Promise.all(promises);
            }
        };

        fetchInitialData();
    }, [initialValues, selectedGrowthStage]);

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
            console.log("formattedValues", formattedValues);


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
            const res = await fetchTargetsByUnit(value, selectedGrowthStage, index, setSelectedTargets);
            console.log("resss", res);

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

    const renderFields = (unit: string, index: number) => {
        const selectedTarget = selectedTargets[index];
        const selectedLandPlot = selectedLandPlots[index];
        const selectedLandRow = selectedLandRows[index];
        const selectedPlant = selectedPlants[index];
        console.log("selectedTarget", selectedTarget);
        console.log("selectedTargetssss", selectedTargets);


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

        const renderLandPlotSelect = () => (
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
                        {selectedTarget?.map((option) => (
                            <Option key={option.landPlotId} value={option.landPlotId}>
                                {option.landPlotName}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
            </Col>
        );

        const renderLandRowSelect = (isMultiple: boolean = false) => (
            <Col span={6}>
                <Form.Item
                    name={[index, 'landRowID']}
                    label="Land Row"
                    rules={[{ required: true, message: 'Please select a land row!' }]}
                >
                    <Select
                        placeholder="Select Land Row"
                        mode={isMultiple ? "multiple" : undefined}
                        onChange={(value) => handleLandRowChange(value, index)}
                        value={selectedLandRow}
                    >
                        {selectedTarget
                            ?.find((target) => target.landPlotId === selectedLandPlot)
                            ?.rows.map((row) => (
                                <Option key={row.landRowId} value={row.landRowId}>
                                    {`Row ${row.rowIndex}`}
                                </Option>
                            ))}
                    </Select>
                </Form.Item>
            </Col>
        );

        const renderPlantSelect = () => (
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
                        {selectedTarget
                            ?.find((target) => target.landPlotId === selectedLandPlot)
                            ?.rows
                            .find((row) => row.landRowId === selectedLandRow[0])
                            ?.plants.map((plant) => (
                                <Option key={plant.plantId} value={plant.plantId}>
                                    {plant.plantName}
                                </Option>
                            ))}
                    </Select>
                </Form.Item>
            </Col>
        );

        switch (unit) {
            case 'landplot':
                return renderLandPlotSelect();
            case 'row':
                return (
                    <>
                        {renderLandPlotSelect()}
                        {renderLandRowSelect(selectedUnits[index] === "row")}
                    </>
                );
            case 'plant':
                return (
                    <>
                        {renderLandPlotSelect()}
                        {renderLandRowSelect()}
                        {renderPlantSelect()}
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <Section title="Plan Targets" subtitle="Define the targets for the care plan.">
            <Form.List name="planTargetModel">
                {(fields, { add, remove }) => {
                    const handleAddField = () => {
                        const newIndex = fields.length;
                        add();
                        setSelectedUnits((prev) => [...prev, ""]);
                        setSelectedLandPlots((prev) => [...prev, undefined]);
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