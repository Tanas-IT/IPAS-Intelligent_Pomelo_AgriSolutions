import { Button, Flex, Form, Select, Space, Typography } from "antd";
import { useEffect, useState } from "react";
import { EmployeeOptionLabel, FormFieldModal, ModalForm, UserAvatar } from "@/components";
import { formatDateReq, formatTimeReq, getUserId, RulesManager } from "@/utils";
import { CROP_STATUS, harvestFormFields, MASTER_TYPE, MESSAGES, WORK_TARGETS } from "@/constants";
import { AssignEmployee, HarvestRequest, GetHarvestDay } from "@/payloads";
import style from "./HarvestModal.module.scss";
import { useMasterTypeOptions, useUserInFarmByRole } from "@/hooks";
import { Icons } from "@/assets";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { useCropStore, useDirtyStore } from "@/stores";
import { EmployeeWithSkills } from "@/payloads/worklog";
import { worklogService } from "@/services";
import { SelectOption } from "@/types";
const Text = Typography;

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
  const { crop } = useCropStore();
  if (!crop) return;
  const [form] = Form.useForm();
  const [modalSize, setModalSize] = useState<"large" | "largeXL">("largeXL");
  const isUpdate = harvestData !== undefined && Object.keys(harvestData).length > 0;
  const { options: productOptions } = useMasterTypeOptions(MASTER_TYPE.PRODUCT);
  const [employeeOptions, setEmployeeOptions] = useState<SelectOption[]>([]);
  const { setIsDirty } = useDirtyStore();
  const isCropCompleted = crop.status === CROP_STATUS.COMPLETED;

  const fetchEmployeeWithHarvestSkill = async () => {
    const res = await worklogService.getEmployeesByWorkTargetSkill(WORK_TARGETS.Harvesting);
    if (res.statusCode === 200 && res.data) {
      const options: SelectOption[] = res.data.map((emp) => ({
        value: emp.userId,
        label: (
          <EmployeeOptionLabel
            fullName={emp.fullName}
            avatarURL={emp.avatarURL}
            skillWithScore={emp.skillWithScore}
          />
        ),
      }));
      setEmployeeOptions(options);
    }
  };

  const resetForm = () => {
    setIsDirty(false);
    form.resetFields();
  };

  useEffect(() => {
    if (!isUpdate) fetchEmployeeWithHarvestSkill();
  }, []);

  useEffect(() => {
    resetForm();
    if (isOpen) {
      setModalSize(isUpdate ? "large" : "largeXL");
      if (harvestData) {
        const schedule = harvestData.carePlanSchedules?.[0];
        let scheduleDate = schedule?.customDates;
        if (scheduleDate) {
          scheduleDate = scheduleDate.replace(/"/g, ""); // Loại bỏ dấu "
        }
        form.setFieldsValue({
          ...harvestData,
          [harvestFormFields.dateHarvest]: harvestData.dateHarvest
            ? dayjs(harvestData.dateHarvest)
            : undefined,
          addNewTask: {
            timeRange:
              schedule?.startTime && schedule?.endTime && scheduleDate
                ? [
                    dayjs(`${scheduleDate} ${schedule.startTime}`, "YYYY/MM/DD HH:mm:ss"),
                    dayjs(`${scheduleDate} ${schedule.endTime}`, "YYYY/MM/DD HH:mm:ss"),
                  ]
                : undefined,
          },
        });
      }
    }
  }, [isOpen]);

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
    const isUpdating = isUpdate && harvestData;
    const taskData = form.getFieldValue("addNewTask") || {};
    const timeRange = taskData.timeRange || [];

    return isUpdating
      ? {
          harvestHistoryId: harvestData.harvestHistoryId,
          dateHarvest:
            formatDateReq(form.getFieldValue(harvestFormFields.dateHarvest)) || undefined,
          harvestHistoryNote: form.getFieldValue(harvestFormFields.harvestHistoryNote),
          startTime: formatTimeReq(timeRange[0]) || undefined,
          endTime: formatTimeReq(timeRange[1]) || undefined,
        }
      : {
          cropId: crop.cropId,
          dateHarvest:
            formatDateReq(form.getFieldValue(harvestFormFields.dateHarvest)) || undefined,
          harvestHistoryNote: form.getFieldValue(harvestFormFields.harvestHistoryNote),
          productHarvestHistory: form.getFieldValue("productHarvestHistory") || [],
          addNewTask: {
            taskName: taskData.taskName,
            assignorId: Number(getUserId()),
            startTime: formatTimeReq(timeRange[0]) || undefined,
            endTime: formatTimeReq(timeRange[1]) || undefined,
            listEmployee: taskData.listEmployee || [],
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
      toast.warning(MESSAGES.HARVEST_DATE_OUT_OF_RANGE);
      return;
    }

    if (!isUpdate) {
      if (!values.productHarvestHistory || values.productHarvestHistory.length === 0) {
        toast.warning(MESSAGES.REQUIRE_PRODUCT);
        return;
      }

      // Kiểm tra ít nhất 1 employee
      if (!values.addNewTask?.listEmployee || values.addNewTask.listEmployee.length === 0) {
        toast.warning(MESSAGES.REQUIRE_EMPLOYEE);
        return;
      }

      const currentDate = dayjs();

      if (!harvestDate || harvestDate.isBefore(currentDate, "day")) {
        toast.warning(MESSAGES.INVALID_HARVEST_DATE);
        return;
      }

      if (harvestDate.isSame(currentDate, "day")) {
        const currentTime = dayjs();
        const startTime = dayjs(values.addNewTask?.timeRange?.[0], "HH:mm");
        const endTime = dayjs(values.addNewTask?.timeRange?.[1], "HH:mm");

        if (!startTime || !endTime || startTime.isBefore(currentTime, "minute")) {
          toast.warning(MESSAGES.INVALID_START_TIME);
          return;
        }
      }

      const hasReporter = values.addNewTask.listEmployee.some(
        (emp: AssignEmployee) => emp.isReporter === true,
      );
      if (!hasReporter) {
        toast.warning(MESSAGES.REQUIRE_REPORTER);
        return;
      }
      // Kiểm tra danh sách sản phẩm có trùng nhau không
      const productList = values.productHarvestHistory || [];
      const productIds = productList.map((prod: any) => prod.masterTypeId);
      const uniqueProductIds = new Set(productIds);
      if (uniqueProductIds.size !== productIds.length) {
        toast.warning(MESSAGES.PRODUCT_DUPLICATE);
        return;
      }
      // Kiểm tra danh sách nhân viên có trùng nhau không
      const employeeList = values.addNewTask?.listEmployee || [];
      const employeeIds = employeeList.map((emp: any) => emp.userId);
      const uniqueEmployeeIds = new Set(employeeIds);
      if (uniqueEmployeeIds.size !== employeeIds.length) {
        toast.warning(MESSAGES.EMPLOYEE_DUPLICATE);
        return;
      }
    }

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
      size={modalSize}
    >
      <Form form={form} layout="vertical" className={style.harvestForm}>
        <Flex gap={20}>
          <fieldset className={style.formSection}>
            <legend>Harvest Information</legend>
            {!isCropCompleted && (
              <FormFieldModal
                type="date"
                label="Harvest Date"
                name={harvestFormFields.dateHarvest}
                rules={RulesManager.getDateRules()}
              />
            )}

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
                        <FormFieldModal label="Unit" name={[name, "unit"]} />
                        <FormFieldModal
                          label="Quantity Need"
                          name={[name, "quantityNeed"]}
                          rules={RulesManager.getNumberRules("Quantity")}
                        />
                        <FormFieldModal
                          label="Cost Price (VND)"
                          name={[name, "costPrice"]}
                          // rules={RulesManager.getPriceRules("Price")}
                        />
                        <FormFieldModal
                          label="Revenue Price (VND)"
                          name={[name, "sellPrice"]}
                          // rules={RulesManager.getNumberRules("Price")}
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
                        type="select"
                        label="Employee"
                        name={[name, "userId"]}
                        options={employeeOptions}
                        rules={RulesManager.getRequiredRules("Employee")}
                      />
                      {/* <Form.Item
                        label="Employee"
                        name={[name, "userId"]}
                        rules={RulesManager.getRequiredRules("Employee")}
                        style={{ flex: 1 }}
                      >
                        <Select
                          style={{ flex: 1, width: "100%" }}
                          showSearch
                          allowClear
                          placeholder="Select an employee"
                          optionLabelProp="label"
                          filterOption={(input, option) =>
                            (option?.label as any)?.props?.fullName
                              ?.toLowerCase()
                              .includes(input.toLowerCase())
                          }
                        >
                          {employeeOptions.map((opt) => (
                            <Select.Option key={opt.value} value={opt.value} label={opt.label}>
                              {opt.label}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item> */}
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

        {/* Update Task Section */}
        {isUpdate && !isCropCompleted && (
          <fieldset className={style.formSection}>
            <legend>Update Task</legend>
            <FormFieldModal
              label="Start & End Time"
              name={["addNewTask", "timeRange"]}
              type="time"
              rules={RulesManager.getRequiredRules("Time")}
              onChange={() => setIsDirty(true)}
            />
          </fieldset>
        )}
      </Form>
    </ModalForm>
  );
};

export default HarvestModal;
