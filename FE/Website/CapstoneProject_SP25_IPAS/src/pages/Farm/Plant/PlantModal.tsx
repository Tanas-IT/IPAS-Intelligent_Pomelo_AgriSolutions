import { Flex, Form } from "antd";
import { useState, useEffect } from "react";
import { FormFieldModal, ModalForm } from "@/components";
import { RulesManager } from "@/utils";
import { HEALTH_STATUS, MASTER_TYPE, plantFormFields } from "@/constants";
import { GetPlant, PlantRequest } from "@/payloads";
import { useMasterTypeOptions } from "@/hooks";
import dayjs from "dayjs";
import style from "./PlantList.module.scss";
import { landPlotService, landRowService } from "@/services";
import { SelectOption } from "@/types";

type PlantModelProps = {
  isOpen: boolean;
  onClose: (values: PlantRequest, isUpdate: boolean) => void;
  onSave: (values: PlantRequest) => void;
  plantData?: GetPlant;
};

const PlantModel = ({ isOpen, onClose, onSave, plantData }: PlantModelProps) => {
  const [form] = Form.useForm();
  const isUpdate = !!plantData;
  const { options: cultivarTypeOptions } = useMasterTypeOptions(MASTER_TYPE.CULTIVAR);

  const [loading, setLoading] = useState({ plots: false, rows: false, indexes: false });
  const [plots, setPlots] = useState<SelectOption[]>([]);
  const [rows, setRows] = useState<SelectOption[]>([]);
  const [plantIndexes, setPlantIndexes] = useState<SelectOption[]>([]);
  const [image, setImage] = useState<File>();

  useEffect(() => {
    if (!isOpen) return;

    form.resetFields();
    setImage(undefined);
    setRows([]);
    setPlantIndexes([]);

    if (isUpdate && plantData) {
      form.setFieldsValue({
        ...plantData,
        masterTypeId: cultivarTypeOptions.find(
          (opt) => opt.value === String(plantData.masterTypeId),
        ),
        plantingDate: dayjs(plantData.plantingDate),
      });
    }

    fetchLandPlots();
  }, [isOpen, plantData]);

  const fetchLandPlots = async () => {
    setLoading((prev) => ({ ...prev, plots: true }));
    try {
      const res = await landPlotService.getLandPlotsSelected();
      if (res.statusCode === 200 && Array.isArray(res.data)) {
        setPlots(res.data.map(({ id, code, name }) => ({ value: id, label: `${code} - ${name}` })));
      }

      if (plantData?.landPlotId && plantData?.plantIndex) {
        setLoading((prev) => ({ ...prev, rows: true, indexes: true }));
        const [rowRes, plantRes] = await Promise.all([
          landRowService.getLandRowsSelected(plantData.landPlotId),
          landRowService.getPlantIndexesByRowId(plantData.landRowId),
        ]);

        if (rowRes.statusCode === 200) {
          setRows(
            rowRes.data.map(({ id, code, name }) => ({ value: id, label: `${code} - ${name}` })),
          );
        }

        if (plantRes.statusCode === 200) {
          let availableIndexes = plantRes.data.map((index) => ({
            value: index,
            label: `Plant #${index}`,
          }));

          if (!availableIndexes.some((item) => item.value === plantData.plantIndex)) {
            availableIndexes.push({
              value: plantData.plantIndex,
              label: `Plant #${plantData.plantIndex}`,
            });
          }

          setPlantIndexes(availableIndexes);
        }
      }
    } finally {
      setLoading({ plots: false, rows: false, indexes: false });
    }
  };

  const handlePlotChange = async (plotId: number) => {
    form.setFieldsValue({
      [plantFormFields.landPlotId]: plotId,
      [plantFormFields.landRowId]: undefined,
      [plantFormFields.plantIndex]: undefined,
    });
    if (!plotId) return setRows([]), setPlantIndexes([]);

    setLoading((prev) => ({ ...prev, rows: true }));
    try {
      const res = await landRowService.getLandRowsSelected(plotId);
      if (res.statusCode === 200) {
        setRows(res.data.map(({ id, code, name }) => ({ value: id, label: `${code} - ${name}` })));
      }
    } finally {
      setLoading((prev) => ({ ...prev, rows: false }));
    }
  };

  const handleRowChange = async (rowId: number) => {
    form.setFieldsValue({
      [plantFormFields.landRowId]: rowId,
      [plantFormFields.plantIndex]: undefined,
    });
    if (!rowId) return setPlantIndexes([]);

    setLoading((prev) => ({ ...prev, indexes: true }));
    try {
      const res = await landRowService.getPlantIndexesByRowId(rowId);
      if (res.statusCode === 200) {
        setPlantIndexes(res.data.map((index) => ({ value: index, label: `Plant #${index}` })));
      }
    } finally {
      setLoading((prev) => ({ ...prev, indexes: false }));
    }
  };

  const getFormData = (): PlantRequest => ({
    plantId: form.getFieldValue(plantFormFields.plantId),
    plantCode: form.getFieldValue(plantFormFields.plantCode),
    healthStatus: HEALTH_STATUS.NORMAL,
    description: form.getFieldValue(plantFormFields.description),
    masterTypeId: Number(
      form.getFieldValue(plantFormFields.masterTypeId)?.value ||
        form.getFieldValue(plantFormFields.masterTypeId),
    ),
    imageUrl: image || form.getFieldValue(plantFormFields.imageUrl),
    plantingDate: form.getFieldValue(plantFormFields.plantingDate)?.format("YYYY-MM-DD") || "",
    landPlotId: form.getFieldValue(plantFormFields.landPlotId),
    landRowId: form.getFieldValue(plantFormFields.landRowId),
    plantIndex: form.getFieldValue(plantFormFields.plantIndex),
  });

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={() => onClose(getFormData(), isUpdate)}
      onSave={async () => {
        await form.validateFields();
        onSave(getFormData());
      }}
      isUpdate={isUpdate}
      title={isUpdate ? "Update Plant" : "Add New Plant"}
      size="large"
    >
      <Form form={form} layout="vertical">
        <FormFieldModal
          type="select"
          label="Cultivar"
          name={plantFormFields.masterTypeId}
          rules={RulesManager.getCultivarRules()}
          options={cultivarTypeOptions}
        />
        <FormFieldModal
          type="date"
          label="Planting Date"
          name={plantFormFields.plantingDate}
          rules={RulesManager.getPlantingDateRules()}
          placeholder="Enter the type name"
        />

        <fieldset className={style.plantLocationContainer}>
          <legend>Plant Location</legend>
          <Flex justify="space-between" gap={20}>
            <FormFieldModal
              type="select"
              label="Plot"
              name={plantFormFields.landPlotId}
              options={plots}
              isLoading={loading.plots}
              onChange={handlePlotChange}
            />
            <FormFieldModal
              type="select"
              label="Row"
              name={plantFormFields.landRowId}
              options={rows}
              isLoading={loading.rows}
              onChange={handleRowChange}
            />
            <FormFieldModal
              type="select"
              label="Plant Index"
              name={plantFormFields.plantIndex}
              options={plantIndexes}
              isLoading={loading.indexes}
            />
          </Flex>
        </fieldset>

        <FormFieldModal
          label="Description"
          type="textarea"
          name={plantFormFields.description}
          placeholder="Enter the description"
        />
        <FormFieldModal
          label="Upload Image"
          type="image"
          image={image}
          name={plantFormFields.imageUrl}
          value={
            typeof form.getFieldValue(plantFormFields.imageUrl) === "string"
              ? form.getFieldValue(plantFormFields.imageUrl)
              : ""
          }
          onChange={setImage}
        />
      </Form>
    </ModalForm>
  );
};

export default PlantModel;
