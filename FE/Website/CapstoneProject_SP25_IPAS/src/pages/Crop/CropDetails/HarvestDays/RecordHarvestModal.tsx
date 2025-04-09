import { Button, Flex, Form } from "antd";
import { useEffect, useState } from "react";
import { FormFieldModal, ModalForm } from "@/components";
import { getUserId, RulesManager } from "@/utils";
import { GetHarvestDay, RecordHarvestRequest, plantHarvestRecords } from "@/payloads";
import style from "./HarvestDays.module.scss";
import { Icons } from "@/assets";
import { toast } from "react-toastify";
import { useCropStore, useDirtyStore } from "@/stores";
import { harvestService, landRowService, plantService } from "@/services";
import { SelectOption } from "@/types";
import { GROWTH_ACTIONS } from "@/constants";

type RecordHarvestModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (value: RecordHarvestRequest) => void;
  isLoadingAction?: boolean;
  harvestData?: GetHarvestDay;
};

const RecordHarvestModal = ({
  isOpen,
  onClose,
  onSave,
  harvestData,
  isLoadingAction,
}: RecordHarvestModalProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState({
    rows: false,
    plants: false,
  });
  const [productOptions, setProductOptions] = useState<SelectOption[]>([]);
  const [rows, setRows] = useState<{ [key: number]: SelectOption[] }>({});
  const [plants, setPlants] = useState<{ [key: number]: SelectOption[] }>({});
  const { setIsDirty } = useDirtyStore();
  const { crop } = useCropStore();
  if (!crop) return;

  const fetchProductOptions = async () => {
    if (!harvestData) return;
    const response = await harvestService.getProductInHarvest(harvestData.harvestHistoryId);
    if (response.statusCode === 200) {
      const options: SelectOption[] = response.data.map((product) => ({
        value: product.id,
        label: product.name,
      }));
      setProductOptions(options);
    }
  };

  const resetForm = () => {
    setIsDirty(false);
    setRows({});
    setPlants({});
    form.resetFields();
  };

  useEffect(() => {
    resetForm();
    if (isOpen) {
      fetchProductOptions();
    }
  }, [isOpen]);

  const handlePlotChange = async (plotId: number, fieldIndex: number) => {
    form.setFieldsValue({ [`recordList.${fieldIndex}.rowId`]: undefined });
    form.setFieldsValue({ [`recordList.${fieldIndex}.plantId`]: undefined });
    if (!plotId) return setRows((prev) => ({ ...prev, [fieldIndex]: [] }));

    setLoading((prev) => ({ ...prev, rows: true }));
    try {
      const res = await landRowService.getLandRowsSelected(plotId);
      if (res.statusCode === 200) {
        setRows((prev) => ({
          ...prev,
          [fieldIndex]: res.data
            ? res.data.map(({ id, name }) => ({
                value: id,
                label: name,
              }))
            : [],
        }));
      }
    } finally {
      setLoading((prev) => ({ ...prev, rows: false }));
    }
  };

  const handleRowChange = async (rowId: number, fieldIndex: number) => {
    form.setFieldsValue({ [`recordList.${fieldIndex}.plantId`]: undefined });

    if (!rowId) return setPlants((prev) => ({ ...prev, [fieldIndex]: [] }));

    setLoading((prev) => ({ ...prev, plants: true }));
    try {
      const res = await plantService.getPlantOfActiveFunction(GROWTH_ACTIONS.HARVEST, rowId);

      if (res.statusCode === 200) {
        setPlants((prev) => ({
          ...prev,
          [fieldIndex]: res.data
            ? res.data.map(({ id, name }) => ({ value: id, label: name }))
            : [],
        }));
      }
    } finally {
      setLoading((prev) => ({ ...prev, plants: false }));
    }
  };

  const getFormData = (): RecordHarvestRequest => {
    const values = form.getFieldsValue(); // Lấy tất cả giá trị từ form

    return {
      masterTypeId: values.product, // ID của sản phẩm
      harvestHistoryId: harvestData?.harvestHistoryId ?? 0, // ID của đợt thu hoạch
      userId: Number(getUserId()), // Lấy userId hiện tại
      plantHarvestRecords:
        values.recordList?.map((record: plantHarvestRecords) => ({
          plantId: record.plantId,
          quantity: record.quantity,
        })) || [],
    };
  };

  const handleOk = async () => {
    await form.validateFields();
    const formData = getFormData();
    const plantIdCounts = new Map<number, { count: number; name: string }>();
    formData.plantHarvestRecords.forEach(({ plantId }) => {
      // Tìm label của plantId từ plants[state]
      const plantLabel = Object.values(plants)
        .flat()
        .find((plant) => plant.value == plantId)?.label;

      if (plantIdCounts.has(plantId)) {
        plantIdCounts.get(plantId)!.count += 1;
      } else {
        plantIdCounts.set(plantId, { count: 1, name: String(plantLabel) });
      }
    });

    // Lọc ra những plantId trùng lặp
    const duplicatePlants = Array.from(plantIdCounts.values())
      .filter(({ count }) => count > 1)
      .map(({ name }) => name);

    if (duplicatePlants.length > 0) {
      toast.error(`Duplicate plants found: ${duplicatePlants.join(", ")}`);
      return;
    }
    // console.log(getFormData());
    onSave(getFormData());
  };

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleOk}
      isLoading={isLoadingAction}
      title={"Record Harvest"}
      size="largeXL"
    >
      <Form form={form} layout="vertical" className={style.harvestForm}>
        <FormFieldModal
          type="select"
          label="Product"
          name="product"
          options={productOptions}
          rules={RulesManager.getRequiredRules("Product")}
        />
        <fieldset className={`${style.formSection} ${style.larger}`}>
          <legend>Record Plant</legend>
          <Form.List name="recordList">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name }, index) => (
                  <Flex key={key} align="center" gap="small">
                    <span>{index + 1}.</span>
                    <FormFieldModal
                      label="Plot"
                      name={[name, "plotId"]}
                      type="select"
                      options={crop?.landPlotCrops?.map((plot) => ({
                        value: plot.landPlotID,
                        label: plot.landPlotName,
                      }))}
                      rules={RulesManager.getRequiredRules("Plot")}
                      onChange={(value) => handlePlotChange(value, index)}
                    />
                    <FormFieldModal
                      label="Row"
                      name={[name, "rowId"]}
                      type="select"
                      options={rows[index] || []}
                      onChange={(value) => handleRowChange(value, index)}
                      rules={RulesManager.getRequiredRules("Row")}
                      isLoading={loading.rows}
                    />
                    <FormFieldModal
                      label="Plant"
                      name={[name, "plantId"]}
                      type="select"
                      options={plants[index] || []}
                      rules={RulesManager.getRequiredRules("Plant")}
                      isLoading={loading.plants}
                    />
                    <FormFieldModal
                      label="Yield"
                      name={[name, "quantity"]}
                      rules={RulesManager.getNumberRulesAllowZero("Quantity")}
                    />

                    <Button
                      onClick={() => {
                        remove(name);
                        if (fields.length - 1 === 0) setIsDirty(false);
                      }}
                      className={style.minus}
                    >
                      -
                    </Button>
                  </Flex>
                ))}
                <Button
                  type="dashed"
                  icon={<Icons.plus />}
                  onClick={() => {
                    add(), setIsDirty(true);
                  }}
                >
                  Add Plant
                </Button>
              </>
            )}
          </Form.List>
        </fieldset>
      </Form>
    </ModalForm>
  );
};

export default RecordHarvestModal;
