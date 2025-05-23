import { Flex, Form } from "antd";
import { useState, useEffect } from "react";
import { FormFieldModal, ModalForm } from "@/components";
import { formatDateReq, isEmployee, RulesManager } from "@/utils";
import { HEALTH_STATUS, MASTER_TYPE, plantFormFields } from "@/constants";
import { GetPlant, PlantRequest } from "@/payloads";
import { useMasterTypeOptions } from "@/hooks";
import dayjs from "dayjs";
import style from "./PlantModal.module.scss";
import { landPlotService, landRowService, plantService } from "@/services";
import { SelectOption } from "@/types";

type PlantModalProps = {
  isOpen: boolean;
  onClose: (values: PlantRequest, isUpdate: boolean) => void;
  onSave: (values: PlantRequest) => void;
  plantData?: GetPlant;
  isLoadingAction?: boolean;
};

const PlantModal = ({ isOpen, onClose, onSave, plantData, isLoadingAction }: PlantModalProps) => {
  const [form] = Form.useForm();
  const isEmployeeIn = isEmployee();
  const isUpdate = !!plantData;
  const isPlantDead = plantData && plantData.isDead;
  const { options: cultivarTypeOptions } = useMasterTypeOptions(
    isEmployeeIn ? undefined : MASTER_TYPE.CULTIVAR,
  );
  const [loading, setLoading] = useState({
    plots: false,
    motherPlant: false,
    rows: false,
    indexes: false,
  });
  const [motherPlants, setMotherPlants] = useState<SelectOption[]>([]);
  const [plots, setPlots] = useState<SelectOption[]>([]);
  const [rows, setRows] = useState<SelectOption[]>([]);
  const [plantIndexes, setPlantIndexes] = useState<SelectOption[]>([]);
  const [image, setImage] = useState<File | string>();

  useEffect(() => {
    if (!isOpen) return;

    form.resetFields();
    setRows([]);
    setPlantIndexes([]);

    if (isUpdate && plantData) {
      form.setFieldsValue({
        ...plantData,
        plantingDate: dayjs(plantData.plantingDate),
      });
      setImage(plantData.imageUrl);
    } else {
      setImage(undefined);
    }

    if (!isEmployeeIn) fetchPlantData();
  }, [isOpen, plantData]);

  const fetchPlantData = async () => {
    setLoading((prev) => ({ ...prev, plots: true, motherPlant: true }));
    try {
      const [landPlotRes, motherPlantRes] = await Promise.all([
        landPlotService.getLandPlotsSelected(),
        plantService.getMotherPlantSelect(),
      ]);

      // Xử lý danh sách thửa đất
      if (landPlotRes.statusCode === 200 && Array.isArray(landPlotRes.data)) {
        setPlots(
          landPlotRes.data.map(({ id, code, name }) => ({ value: id, label: `${name} - ${code}` })),
        );
      }

      // Xử lý danh sách mother plant
      if (motherPlantRes.statusCode === 200 && Array.isArray(motherPlantRes.data)) {
        setMotherPlants(
          motherPlantRes.data.map(({ id, code }) => ({
            value: id,
            label: code,
          })),
        );
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
      setLoading({ motherPlant: false, plots: false, rows: false, indexes: false });
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
        // setRows(res.data.map(({ id, code, name }) => ({ value: id, label: `${name} - ${code}` })));
        const data = res.data ?? [];
        setRows(
          data.length
            ? data.map(({ id, code, name }) => ({ value: id, label: `${name} - ${code}` }))
            : [],
        );
      } else {
        setRows([]);
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
        const data = res.data ?? [];
        // if (res.data)
        // setPlantIndexes(res.data.map((index) => ({ value: index, label: `Plant #${index}` })));
        setPlantIndexes(
          data.length ? data.map((index) => ({ value: index, label: `Plant #${index}` })) : [],
        );
      } else {
        setPlantIndexes([]);
      }
    } finally {
      setLoading((prev) => ({ ...prev, indexes: false }));
    }
  };

  const getFormData = (): PlantRequest => {
    const description = form.getFieldValue(plantFormFields.description);
    const plantId = form.getFieldValue(plantFormFields.plantId);

    if (isPlantDead) return { plantId, description };

    return {
      plantId,
      plantCode: form.getFieldValue(plantFormFields.plantCode),
      description,
      healthStatus: isUpdate
        ? form.getFieldValue(plantFormFields.healthStatus)
        : HEALTH_STATUS.HEALTHY,
      plantReferenceId: form.getFieldValue(plantFormFields.plantReferenceId),
      masterTypeId: Number(
        form.getFieldValue(plantFormFields.masterTypeId)?.value ||
          form.getFieldValue(plantFormFields.masterTypeId),
      ),
      // imageUrl: image || form.getFieldValue(plantFormFields.imageUrl),
      imageUrl: image !== undefined ? image : plantData?.imageUrl,
      plantingDate: formatDateReq(form.getFieldValue(plantFormFields.plantingDate)) || undefined,
      ...(!isUpdate && {
        landPlotId: form.getFieldValue(plantFormFields.landPlotId),
        landRowId: form.getFieldValue(plantFormFields.landRowId),
        plantIndex: form.getFieldValue(plantFormFields.plantIndex),
      }),
    };
  };

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={() => onClose(getFormData(), isUpdate)}
      onSave={async () => {
        await form.validateFields();
        onSave(getFormData());
      }}
      isLoading={isLoadingAction}
      isUpdate={isUpdate}
      title={isUpdate ? "Update Plant" : "Add New Plant"}
      size="large"
    >
      <Form form={form} layout="vertical">
        {isPlantDead ? (
          <FormFieldModal
            label="Description"
            type="textarea"
            name={plantFormFields.description}
            placeholder="Enter the description"
          />
        ) : isEmployeeIn ? (
          <FormFieldModal
            type="select"
            label="Health Status"
            name={plantFormFields.healthStatus}
            rules={RulesManager.getSelectHealthStatusRules()}
            options={Object.keys(HEALTH_STATUS).map((key) => ({
              value: HEALTH_STATUS[key as keyof typeof HEALTH_STATUS],
              label: HEALTH_STATUS[key as keyof typeof HEALTH_STATUS],
            }))}
          />
        ) : (
          <>
            <Flex justify="space-between" gap={20}>
              <FormFieldModal
                type="select"
                label="Cultivar"
                name={plantFormFields.masterTypeId}
                rules={RulesManager.getCultivarRules()}
                options={cultivarTypeOptions}
              />
              <FormFieldModal
                type="select"
                label="Mother Plant"
                name={plantFormFields.plantReferenceId}
                options={motherPlants}
              />
            </Flex>

            <Flex justify="space-between" gap={20}>
              <FormFieldModal
                type="date"
                label="Planting Date"
                name={plantFormFields.plantingDate}
                rules={RulesManager.getPlantingDateRules()}
              />
              {isUpdate && (
                <FormFieldModal
                  type="select"
                  label="Health Status"
                  name={plantFormFields.healthStatus}
                  rules={RulesManager.getSelectHealthStatusRules()}
                  options={Object.keys(HEALTH_STATUS).map((key) => ({
                    value: HEALTH_STATUS[key as keyof typeof HEALTH_STATUS],
                    label: HEALTH_STATUS[key as keyof typeof HEALTH_STATUS],
                  }))}
                />
              )}
            </Flex>

            {!isUpdate && (
              <fieldset className={style.plantLocationContainer}>
                <legend>Plant Location</legend>
                <Flex justify="space-between" vertical>
                  <FormFieldModal
                    type="select"
                    label="Plot"
                    name={plantFormFields.landPlotId}
                    options={plots}
                    isLoading={loading.plots}
                    onChange={handlePlotChange}
                    rules={RulesManager.getSelectPlotRules()}
                  />
                  <Flex gap={20}>
                    <FormFieldModal
                      type="select"
                      label="Row"
                      name={plantFormFields.landRowId}
                      options={rows}
                      isLoading={loading.rows}
                      onChange={handleRowChange}
                      rules={RulesManager.getSelectRowRules()}
                    />
                    <FormFieldModal
                      type="select"
                      label="Plant Index"
                      name={plantFormFields.plantIndex}
                      options={plantIndexes}
                      isLoading={loading.indexes}
                      rules={RulesManager.getSelectPlantIndexRules()}
                    />
                  </Flex>
                </Flex>
              </fieldset>
            )}

            <FormFieldModal
              label="Description"
              type="textarea"
              name={plantFormFields.description}
              placeholder="Enter the description"
            />
          </>
        )}
      </Form>
    </ModalForm>
  );
};

export default PlantModal;
