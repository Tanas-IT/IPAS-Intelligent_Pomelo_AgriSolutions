import React, { useEffect, useState } from 'react';
import { Form, Select, Row, Col, Button, Table, message, Modal, Alert } from 'antd';
import { ConfirmModal, Section } from '@/components';
import { Icons } from '@/assets';
import { planService } from '@/services';
import { fetchTargetsByUnit, getFarmId, isTargetOverlapping, unitOptions } from '@/utils';
import { SelectedTarget } from '@/payloads';
import { useModal } from '@/hooks';

const { Option } = Select;

type OptionType<T = string | number> = { value: T; label: string };

interface PlanTargetProps {
  landPlotOptions: OptionType[];
  landRows: OptionType[];
  plants: OptionType[];
  plantLots: OptionType[];
  graftedPlants: OptionType[];
  selectedGrowthStage: number[];
  onLandPlotChange?: (landPlotId: number) => void;
  onLandRowChange?: (landPlotId: number) => void;
  hasSelectedCrop: boolean;
  onClearTargets: () => void;
}

const PlanTarget = ({
  landPlotOptions,
  landRows,
  plants,
  plantLots,
  graftedPlants,
  selectedGrowthStage,
  hasSelectedCrop,
  onClearTargets,
  // onLandPlotChange,
  // onLandRowChange,
}: PlanTargetProps) => {
  const [, forceUpdate] = useState({});
  const [selectedUnits, setSelectedUnits] = useState<(string | undefined)[]>([]);
  const [selectedLandPlots, setSelectedLandPlots] = useState<(number | undefined)[]>([]);
  const [selectedLandRows, setSelectedLandRows] = useState<number[][]>([]);
  const [selectedPlants, setSelectedPlants] = useState<number[][]>([]);
  const [modalProps, setModalProps] = useState<any>({});
  const [selectedPlantLots, setSelectedPlantLots] = useState<number[][]>([]);
  const [selectedGraftedPlants, setSelectedGraftedPlants] = useState<number[][]>([]);
  const [form] = Form.useForm();
  const [selectedTargets, setSelectedTargets] = useState<SelectedTarget[][]>([]);
  const warningModal = useModal();
  console.log("selectedTargets in add", selectedTargets);
  useEffect(() => {
    if (hasSelectedCrop) {
      onClearTargets(); // Gọi callback để xóa dữ liệu trong form
    }
  }, [hasSelectedCrop, onClearTargets]);

  const showModal = (title: string, content: string, onOk: () => void) => {
    Modal.confirm({
      title,
      content,
      onOk,
      onCancel: () => message.info("Cancel action!"),
    });
  };


  const handleUnitChange = async (value: string, index: number, remove: (index: number) => void) => {
    if (!selectedGrowthStage) {
      message.warning("Please select a growth stage first.");
      return;
    }

    // neu chon cung unit
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
      // await fetchTargetsByUnit(value, index);
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

  const handleLandPlotChange = (value: number, index: number, remove: (index: number) => void) => {
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
      // Thiết lập props cho ConfirmModal
      setModalProps({
        visible: true,
        actionType: "warning",
        title: "Warning",
        description: "You have selected a target that overlaps with or is contained within a previously chosen target. Please select in the existing target.",
        onConfirm: () => {
          console.log("Before reset - landPlotID:", form.getFieldValue(['planTargetModel', index, 'landPlotID']));
          console.log("Before reset - selectedLandPlots:", selectedLandPlots);
          remove(index);
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
          console.log("After reset - landPlotID:", form.getFieldValue(['planTargetModel', index, 'landPlotID']));
          console.log("After reset - selectedLandPlots:", selectedLandPlots);
          forceUpdate({});
          warningModal.hideModal(); // Đóng modal sau khi xử lý
        },
        onCancel: () => {
          remove(index);
          warningModal.hideModal(); // Đóng modal khi hủy bỏ
        },
      });
      warningModal.showModal(); // Hiển thị modal
      return;
    }

    //cap nhat neu k trung
    setSelectedLandPlots((prev) => {
      const newSelectedLandPlots = [...prev];
      newSelectedLandPlots[index] = value;
      return newSelectedLandPlots;
    });
  };

  useEffect(() => {
    console.log("Selected Land Plots updated:", selectedLandPlots);
  }, [selectedLandPlots]);

  const handleLandRowChange = (value: number | number[], index: number, remove: (index: number) => void) => {
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
      // Thiết lập props cho ConfirmModal
      setModalProps({
        visible: true,
        actionType: "warning",
        title: "Warning",
        description: "You have selected a target that overlaps with or is contained within a previously chosen target. Please select in the existing target.",
        onConfirm: () => {
          remove(index);
          setSelectedLandRows((prev) => {
            const newSelectedLandRows = [...prev];
            newSelectedLandRows[index] = [];
            return newSelectedLandRows;
          });
          console.log("Before reset - landRowID:", form.getFieldValue(['planTargetModel', index, 'landRowID']));

          form.setFieldsValue({
            planTargetModel: {
              [index]: {
                landRowID: undefined,
              },
            },
          });
          console.log("After reset - landRowID:", form.getFieldValue(['planTargetModel', index, 'landRowID']));

          forceUpdate({});
          warningModal.hideModal(); // Đóng modal sau khi xử lý
        },
        onCancel: () => {
          remove(index);
          warningModal.hideModal(); // Đóng modal khi hủy bỏ
        },
      });
      warningModal.showModal(); // Hiển thị modal
      return;
    }

    //cap nhat neu k trung
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

  const handlePlantChange = (value: number[], index: number, remove: (index: number) => void) => {
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
      // Thiết lập props cho ConfirmModal
      setModalProps({
        visible: true,
        actionType: "warning",
        title: "Warning",
        description: "You have selected a target that overlaps with or is contained within a previously chosen target. Please select in the existing target.",
        onConfirm: () => {
          remove(index);
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
          warningModal.hideModal(); // Đóng modal sau khi xử lý
        },
        onCancel: () => {
          remove(index);
          warningModal.hideModal(); // Đóng modal khi hủy bỏ
        },
      });
      warningModal.showModal(); // Hiển thị modal
      return;
    }

    //cap nhat neu k trung
    setSelectedPlants((prev) => {
      const newSelectedPlants = [...prev];
      newSelectedPlants[index] = value;
      return newSelectedPlants;
    });
  };
  console.log("selectedTargets", selectedTargets);


  const renderFields = (unit: string, index: number, remove: (index: number) => void) => {
    const selectedTarget = selectedTargets[index];
    const selectedLandPlot = selectedLandPlots[index];
    const selectedLandRow = selectedLandRows[index];
    console.log("selectedTarget in addplan", selectedTarget);
    

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
            onChange={(value) => {
              console.log("log index", index);

              handleLandPlotChange(value, index, remove)
            }}
          >
            {selectedTarget?.map((target) => (
              <Option key={target.landPlotId} value={target.landPlotId}>
                {target.landPlotName}
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
            onChange={(value) => handleLandRowChange(value, index, remove)}
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
            onChange={(value) => handlePlantChange(value, index, remove)}
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
                        onChange={(value) => handleUnitChange(value, name, remove)}
                      >
                        {unitOptions.map((unit) => (
                          <Option key={unit.value} value={unit.value}>
                            {unit.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  {selectedUnits[name] && renderFields(selectedUnits[name], name, remove)}
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
      <ConfirmModal
        visible={warningModal.modalState.visible}
        onConfirm={modalProps.onConfirm}
        onCancel={modalProps.onCancel}
        actionType={modalProps.actionType}
        title={modalProps.title}
        description={modalProps.description}
        maskClosable={false}
      />
    </Section>
  );
};

export default PlanTarget;