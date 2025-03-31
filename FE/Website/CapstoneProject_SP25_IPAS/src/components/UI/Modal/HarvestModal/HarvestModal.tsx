import { Button, Flex, Form } from "antd";
import { useEffect } from "react";
import { FormFieldModal, ModalForm } from "@/components";
import { formatDateReq, formatTimeReq, getUserId, RulesManager } from "@/utils";
import { harvestFormFields, MASTER_TYPE, MESSAGES, UserRole } from "@/constants";
import { AssignEmployee, HarvestRequest, GetHarvestDay, productHarvestHistory } from "@/payloads";
import style from "./HarvestModal.module.scss";
import { useMasterTypeOptions, useUserInFarmByRole } from "@/hooks";
import { Icons } from "@/assets";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { useCropStore, useDirtyStore } from "@/stores";

type HarvestModalProps = {
  isOpen: boolean;
  onClose: (values: HarvestRequest, isUpdate: boolean) => void;
  onSave: (values: HarvestRequest) => void;
  isLoadingAction?: boolean;
  harvestData?: GetHarvestDay;
};

const HarvestModal = ({
  isOpen,
  onClose,
  onSave,
  harvestData,
  isLoadingAction,
}: HarvestModalProps) => {
  const [form] = Form.useForm();
  const isUpdate = harvestData !== undefined && Object.keys(harvestData).length > 0;
  const { options: productOptions } = useMasterTypeOptions(MASTER_TYPE.PRODUCT);
  const { options: employeeOptions } = useUserInFarmByRole([UserRole.Employee], true);
  const { setIsDirty } = useDirtyStore();
  const { crop } = useCropStore();
  if (!crop) return;

  const resetForm = () => form.resetFields();

  useEffect(() => {
    resetForm();
    if (isOpen && harvestData) {
      form.setFieldsValue({
        ...harvestData,
        [harvestFormFields.dateHarvest]: harvestData.dateHarvest
          ? dayjs(harvestData.dateHarvest)
          : undefined,
      });
    }
  }, [isOpen, harvestData]);

  const handleReporterChange = (selectedIndex: number) => {
    const currentValues = form.getFieldValue(["addNewTask", "listEmployee"]) || [];
    const updatedValues = currentValues.map((item: any, index: number) => ({
      ...item,
      isReporter: index === selectedIndex, // Chỉ báo cáo nếu index trùng với selectedIndex
    }));

    form.setFieldsValue({
      addNewTask: { listEmployee: updatedValues },
    });
  };

  const getFormData = (): HarvestRequest => {
    const productHarvestList: productHarvestHistory[] =
      form.getFieldValue("productHarvestHistory") || [];
    const taskData = form.getFieldValue("addNewTask") || {};

    return {
      ...(isUpdate ? { harvestHistoryId: harvestData.harvestHistoryId } : {}),
      cropId: crop.cropId,
      dateHarvest: formatDateReq(form.getFieldValue(harvestFormFields.dateHarvest)) || undefined,
      totalPrice: form.getFieldValue(harvestFormFields.totalPrice),
      harvestHistoryNote: form.getFieldValue(harvestFormFields.harvestHistoryNote),
      productHarvestHistory: productHarvestList as productHarvestHistory[],
      addNewTask: {
        taskName: taskData.taskName,
        assignorId: Number(getUserId()),
        startTime: formatTimeReq(taskData.timeRange?.[0]) || undefined,
        endTime: formatTimeReq(taskData.timeRange?.[1]) || undefined,
        listEmployee: taskData.listEmployee as AssignEmployee[],
      },
    };
  };

  const handleOk = async () => {
    await form.validateFields();
    const values = form.getFieldsValue();

    const harvestDate = dayjs(values[harvestFormFields.dateHarvest]);
    const startDate = dayjs(crop.startDate);
    const endDate = dayjs(crop.endDate);

    if (!harvestDate.isBetween(startDate, endDate, "day", "[]")) {
      toast.error(MESSAGES.HARVEST_DATE_OUT_OF_RANGE);
      return;
    }

    if (!isUpdate) {
      if (!values.productHarvestHistory || values.productHarvestHistory.length === 0) {
        toast.error(MESSAGES.REQUIRE_PRODUCT);
        return;
      }

      // Kiểm tra ít nhất 1 employee
      if (!values.addNewTask?.listEmployee || values.addNewTask.listEmployee.length === 0) {
        toast.error(MESSAGES.REQUIRE_EMPLOYEE);
        return;
      }

      const currentDate = dayjs();

      if (!harvestDate || harvestDate.isBefore(currentDate, "day")) {
        toast.error(MESSAGES.INVALID_HARVEST_DATE);
        return;
      }

      if (harvestDate.isSame(currentDate, "day")) {
        const currentTime = dayjs();
        const startTime = dayjs(values.addNewTask?.timeRange?.[0], "HH:mm");
        const endTime = dayjs(values.addNewTask?.timeRange?.[1], "HH:mm");

        if (!startTime || !endTime || startTime.isBefore(currentTime, "minute")) {
          toast.error(MESSAGES.INVALID_START_TIME);
          return;
        }
      }

      const hasReporter = values.addNewTask.listEmployee.some(
        (emp: AssignEmployee) => emp.isReporter === true,
      );
      if (!hasReporter) {
        toast.error(MESSAGES.REQUIRE_REPORTER);
        return;
      }
    }

    // console.log(getFormData());
    onSave(getFormData());
  };

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={() => onClose(getFormData(), isUpdate)}
      onSave={handleOk}
      isUpdate={isUpdate}
      isLoading={isLoadingAction}
      title={isUpdate ? "Update Harvest" : "Add New Harvest"}
      size={isUpdate ? "large" : "largeXL"}
    >
      <Form form={form} layout="vertical" className={style.harvestForm}>
        <Flex gap={20}>
          <fieldset className={style.formSection}>
            <legend>Harvest Information</legend>
            <Flex gap={20}>
              <FormFieldModal
                type="date"
                label="Harvest Date"
                name={harvestFormFields.dateHarvest}
                rules={RulesManager.getDateRules()}
              />
              <FormFieldModal
                label="Total Price (VND)"
                name={harvestFormFields.totalPrice}
                placeholder="Enter price (e.g. 100.000)"
                rules={RulesManager.getNumberRules("Price")}
              />
            </Flex>

            <FormFieldModal
              type="textarea"
              label="Note"
              name={harvestFormFields.harvestHistoryNote}
            />
          </fieldset>

          {/* Product Harvest History Section */}
          {!isUpdate && (
            <fieldset className={`${style.formSection} ${style.larger}`}>
              <legend>Product Harvest</legend>
              <Form.List name="productHarvestHistory">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name }, index) => (
                      <Flex key={key} align="center" gap="small">
                        <span>{index + 1}.</span>
                        <FormFieldModal
                          label="Product"
                          name={[name, "masterTypeId"]}
                          type="select"
                          options={productOptions}
                          rules={RulesManager.getRequiredRules("Product")}
                        />
                        <FormFieldModal
                          label="Unit"
                          name={[name, "unit"]}
                          rules={RulesManager.getRequiredRules("Unit")}
                        />
                        <FormFieldModal
                          label="Sell Price"
                          name={[name, "sellPrice"]}
                          rules={RulesManager.getNumberRules("Price")}
                        />
                        <FormFieldModal
                          label="Quantity Need"
                          name={[name, "quantityNeed"]}
                          rules={RulesManager.getNumberRules("Quantity")}
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
                        add({ unit: "kg" }), setIsDirty(true);
                      }}
                    >
                      Add Product
                    </Button>
                  </>
                )}
              </Form.List>
            </fieldset>
          )}
        </Flex>

        {/* Add New Task Section */}
        {!isUpdate && (
          <fieldset className={style.formSection}>
            <legend>New Task</legend>
            <Flex gap={20}>
              <FormFieldModal
                label="Task Name"
                name={["addNewTask", "taskName"]}
                rules={RulesManager.getRequiredRules("Task Name")}
              />
              <FormFieldModal
                label="Start & End Time"
                name={["addNewTask", "timeRange"]}
                type="time"
                rules={RulesManager.getRequiredRules("Time")}
              />
            </Flex>

            {/* <FormFieldModal label="Date Work" name={["addNewTask", "dateWork"]} type="date" /> */}
            <Form.List name={["addNewTask", "listEmployee"]}>
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name }, index) => (
                    <Flex key={key} align="center" gap={20}>
                      <span>{index + 1}.</span>
                      <FormFieldModal
                        label="Employee"
                        name={[name, "userId"]}
                        type="select"
                        options={employeeOptions}
                        rules={RulesManager.getRequiredRules("Employee")}
                      />
                      <FormFieldModal
                        label="Is Reporter"
                        name={[name, "isReporter"]}
                        type="radio"
                        isSingleRadio
                        onChange={() => handleReporterChange(name)}
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
                      add({ isReporter: false }), setIsDirty(true);
                    }}
                  >
                    Add Employee
                  </Button>
                </>
              )}
            </Form.List>
          </fieldset>
        )}
      </Form>
    </ModalForm>
  );
};

export default HarvestModal;
