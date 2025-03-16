import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  DatePicker,
  TimePicker,
  Select,
  Row,
  Col,
  Divider,
  Modal,
  Flex,
} from "antd";
import moment, { Moment } from "moment";
import { CustomButton, InfoField, Section, Tooltip } from "@/components";
import style from "./PlanList.module.scss";
import dayjs, { Dayjs } from "dayjs";
import DaySelector from "./DaySelector";
import AssignEmployee from "./AssignEmployee";
import { Icons } from "@/assets";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes";
import { useCropCurrentOption, useGrowthStageOptions, useLocalStorage, useNotifications, useUnsavedChangesWarning } from "@/hooks";
import {
  fetchProcessesOfFarm,
  fetchUserInfoByRole,
  getFarmId,
  getGrowthStageOfProcess,
  getTypeOfProcess,
  getUserId,
  isDayInRange,
  RulesManager,
} from "@/utils";
import { addPlanFormFields, frequencyOptions, MASTER_TYPE } from "@/constants";
import {
  cropService,
  planService,
} from "@/services";
import { toast } from "react-toastify";
import { PlanRequest } from "@/payloads/plan/requests/PlanRequest";
import PlanTarget from "./PlanTarget";
import useLandRowOptions from "@/hooks/useLandRowOptions";
import useLandPlotOptions from "@/hooks/useLandPlotOptions";
import useGraftedPlantOptions from "@/hooks/useGraftedPlantOptions";
import usePlantOfRowOptions from "@/hooks/usePlantOfRowOptions";
import isBetween from "dayjs/plugin/isBetween";
import { SelectOption } from "@/types";
import usePlantLotOptions from "@/hooks/usePlantLotOptions";

dayjs.extend(isBetween);

const { RangePicker } = DatePicker;

type OptionType<T = string | number> = { value: T; label: string };
type EmployeeType = { fullName: string; avatarURL: string; userId: number };

const AddPlan = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const userId = Number(getUserId());
  const farmId = Number(getFarmId());
  const { getAuthData } = useLocalStorage();
  const authData = getAuthData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedLandPlot, setSelectedLandPlot] = useState<number | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<EmployeeType[]>([]);
  const [selectedReporter, setSelectedReporter] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [processFarmOptions, setProcessFarmOptions] = useState<OptionType<number>[]>([]);
  const [employee, setEmployee] = useState<EmployeeType[]>([]);
  const [assignorId, setAssignorId] = useState<number>();
  const [frequency, setFrequency] = useState<string>("none");
  const [customDates, setCustomDates] = useState<Dayjs[]>([]); // Frequency: none
  const [dayOfWeek, setDayOfWeek] = useState<number[]>([]); // Frequency: weekly
  const [dayOfMonth, setDayOfMonth] = useState<number[]>([]); // Frequency: monthly
  const [selectedLandRow, setSelectedLandRow] = useState<number | null>(null);
  const [selectedGrowthStage, setSelectedGrowthStage] = useState<number[]>([]);
  const [isLockedGrowthStage, setIsLockedGrowthStage] = useState<boolean>(false);
  const [checked, setChecked] = useState<boolean>(false);

  const { options: growthStageOptions } = useGrowthStageOptions(false);
  const { options: landPlots } = useLandPlotOptions();
  const { options: landRowOptions } = useLandRowOptions(selectedLandPlot);
  const { options: plantsOptions } = usePlantOfRowOptions(selectedLandRow);
  const { options: plantLotOptions } = usePlantLotOptions();
  const { options: graftedPlantsOptions } = useGraftedPlantOptions(farmId);
  const { options: cropOptions } = useCropCurrentOption();

  const [selectedCrop, setSelectedCrop] = useState<number | null>(null);
  const [landPlotOfCropOptions, setLandPlotOfCropOptions] = useState<SelectOption[]>([]);
  const [processTypeOptions, setProcessTypeOptions] = useState<SelectOption[]>([]);

  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedCrop) {
      form.setFieldValue("listLandPlotOfCrop", []);
      cropService.getLandPlotOfCrop(selectedCrop).then((data) => {
        setLandPlotOfCropOptions(data.data.map((item) => ({ value: item.landPlotId, label: item.landPlotName })));

      });
    } else {
      setLandPlotOfCropOptions([]);
    }
  }, [selectedCrop]);

  const handleChangeProcess = async (processId: number | undefined) => {
    if (processId) {
      const growthStageId = await getGrowthStageOfProcess(processId);
      const masterTypeId = await getTypeOfProcess(processId);
      form.setFieldValue("growthStageId", [growthStageId]);
      form.setFieldValue("masterTypeId", Number(masterTypeId));
      setIsLockedGrowthStage(true);

      const processType = await planService.filterTypeWorkByGrowthStage([growthStageId]).then((data) => {
        setProcessTypeOptions(data.map((item) => ({
          value: item.masterTypeId,
          label: item.masterTypeName
        })));
      });
    } else {
      form.setFieldValue("growthStageId", undefined);
      setIsLockedGrowthStage(false);
      setProcessTypeOptions([]);
    }
  };

  const handleDateRangeChange = (dates: (Dayjs | null)[] | null) => {
    if (!dates || dates.some(date => date === null)) {
      setDateRange(null);
      setDateError("Please select a valid date range!");
      form.setFieldsValue({ dateRange: null });
      return;
    }

    const [startDate, endDate] = dates as [Dayjs, Dayjs];
    setDateRange([startDate, endDate]);
    setDateError(null);
    form.setFieldsValue({ dateRange: [startDate, endDate] });

    if (frequency === "None" && customDates.length === 1) {
      Modal.confirm({
        title: "Adjust Date Range",
        content: "You have selected only one custom date. Do you want to adjust the date range to match this date?",
        onOk: () => {
          const newDateRange = [customDates[0], customDates[0]] as [Dayjs, Dayjs];
          setDateRange(newDateRange);
          form.setFieldsValue({ dateRange: newDateRange });
        },
        onCancel: () => {
          setCustomDates([]);
        },
      });
    }
  };
  console.log(form.getFieldsValue());

  const handleDateChange = (dates: Dayjs[]) => {
    if (!dateRange) {
      setDateError("Please select the date range first!");
      return;
    }

    const [startDate, endDate] = dateRange;
    const isValid = dates.every((date) => date.isBetween(startDate, endDate, "day", "[]"));

    if (!isValid) {
      setDateError("Selected dates must be within the date range.");
    } else {
      setDateError(null);
      setCustomDates(dates);

      if (frequency === "None" && dates.length === 1) {
        Modal.confirm({
          title: "Adjust Date Rangetttttt",
          content: "You have selected only one custom date. Do you want to adjust the date range to match this date?",
          onOk: () => {
            setDateRange([dates[0], dates[0]]);
            form.setFieldsValue({ dateRange: [dates[0], dates[0]] });
          },
          onCancel: () => {
            setCustomDates([]);
          },
        });
      }
      console.log("dates", dates);

    }
  };

  const handleFrequencyChange = (value: string) => {
    setFrequency(value);

    if (dateRange && dateRange[0].isSame(dateRange[1], "day")) {
      Modal.confirm({
        title: "Adjust Date Range",
        content: "The selected date range is too short. Do you want to adjust it?",
        onOk: () => {
          const newEndDate = value === "Weekly"
            ? dateRange[0].add(6, "day")
            : dateRange[0].add(1, "month");
          setDateRange([dateRange[0], newEndDate]);
        },
        onCancel: () => {
          // Không làm gì
        },
      });
    }
  };

  const { isModalVisible, handleCancelNavigation, handleConfirmNavigation } =
    useUnsavedChangesWarning(isFormDirty);

  const handleReporterChange = (userId: number) => {
    setSelectedReporter(userId);
  };

  const handleAssignMember = () => setIsModalOpen(true);

  const handleConfirmAssign = () => {
    setAssignorId(userId);
    // if (selectedIds.length === 0) {
    //   setErrorMessage("Please select at least one employee.");
    //   return;
    // }

    setSelectedEmployees(employee.filter((m) => selectedIds.includes(Number(m.userId))));
    setIsModalOpen(false);
  };

  const handleWeeklyDaySelection = (days: number[]) => {
    setDayOfWeek(days);
  };

  const handleMonthlyDaySelection = (days: number[]) => {
    setDayOfMonth(days);
  };

  const handleSaveDays = (days: number[], type: "weekly" | "monthly") => {
    if (!dateRange) {
      setDateError("Please select the date range first!");
      return;
    }
    const [startDate, endDate] = dateRange;

    // filter ra các ngày hợp lệ
    const validDays = days.filter((day) => isDayInRange(day, startDate, endDate, type));

    // không có ngày nào hợp lệ
    if (validDays.length === 0) {
      setDateError(`All selected ${type === "weekly" ? "days" : "dates"} are not within the date range. Please select again.`);
      return;
    }

    // có ngày không hợp lệ
    if (validDays.length < days.length) {
      setDateError(`Some selected ${type === "weekly" ? "days" : "dates"} are not within the date range. Only valid ${type === "weekly" ? "days" : "dates"} will be saved.`);
      if (type === "weekly") {
        setDayOfWeek(validDays);
      } else if (type === "monthly") {
        setDayOfMonth(validDays);
      }
    } else {
      setDateError(null);
    }

    if (validDays.length === 1) {
      Modal.confirm({
        title: "Adjust Date Range",
        content: `You have selected only one ${type === "weekly" ? "day" : "date"}. Do you want to adjust the date range to match this ${type === "weekly" ? "day" : "date"}?`,
        onOk: () => {
          const selectedDay = validDays[0];
          let targetDate = startDate.clone();

          if (type === "weekly") {
            while (targetDate.day() !== selectedDay) {
              targetDate = targetDate.add(1, "day");
            }
          } else if (type === "monthly") {
            targetDate = startDate.date(selectedDay);
          }

          const newDateRange = [targetDate, targetDate] as [Dayjs, Dayjs];
          setDateRange(newDateRange);
          form.setFieldsValue({ dateRange: newDateRange });
        },
        onCancel: () => {
          // Không làm gì
        },
      });
    }
  };



  const handleSubmit = async (values: any) => {
    const { dateRange, timeRange, planTargetModel } = values;
    const startDate = new Date(dateRange?.[0]);
    const endDate = new Date(dateRange?.[1]);

    const adjustedStartDate = new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000);
    const adjustedEndDate = new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000);

    const startTime = timeRange?.[0]?.toDate().toLocaleTimeString();
    const endTime = timeRange?.[1]?.toDate().toLocaleTimeString();

    if (assignorId === undefined) {
      toast.error("Please select at least one employee.");
      return;
    }

    if (!selectedCrop && planTargetModel.length === 0) {
      toast.error("Please select at least one plan target.");
      return;
    }

    const planData: PlanRequest = {
      planName: values.planName,
      planDetail: values.planDetail,
      notes: values.notes || "",
      cropId: values.cropId,
      processId: values.processId,
      growthStageId: values.growthStageId,
      frequency: values.frequency,
      isActive: values.isActive,
      masterTypeId: values.masterTypeId,
      assignorId,
      responsibleBy: values.responsibleBy || "",
      pesticideName: values.pesticideName || "",
      maxVolume: values.maxVolume || 0,
      minVolume: values.minVolume || 0,
      isDelete: values.isDelete || false,
      listEmployee: selectedEmployees.map((employee) => ({
        userId: employee.userId,
        isReporter: employee.userId === selectedReporter,
      })),
      dayOfWeek,
      dayOfMonth,
      customDates: customDates.map((date) => date.toISOString()),
      startDate: adjustedStartDate.toISOString(),
      endDate: adjustedEndDate.toISOString(),
      startTime: startTime,
      endTime: endTime,
      planTargetModel: planTargetModel.map((target: any) => ({
        landPlotID: target.landPlotID ?? 0,
        landRowID: target.landRowID ?? [],
        plantID: target.plantID ?? [],
        graftedPlantID: target.graftedPlantID ?? [],
        plantLotID: target.plantLotID ?? [],
        unit: target.unit
      })),
      listLandPlotOfCrop: values.listLandPlotOfCrop
    };
    console.log("planData", planData);

    const result = await planService.addPlan(planData);

    if (result.statusCode === 200) {
      await toast.success(result.message);
      navigate(`${PATHS.PLAN.PLAN_LIST}?sf=createDate&sd=desc`);
      form.resetFields();
    } else {
      toast.error(result.message);
    }

    setIsFormDirty(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      setProcessFarmOptions(await fetchProcessesOfFarm(farmId, true));
      console.log("d");
      setEmployee(await fetchUserInfoByRole("User"));
    };

    fetchData();
  }, []);

  return (
    <div className={style.contentSectionBody}>
      <Flex gap={40} align="center">
        <Tooltip title="Back to List">
          <Icons.back
            className={style.backIcon}
            size={20}
            onClick={() => {
              if (isFormDirty) {
                Modal.confirm({
                  title: "Are you sure you want to leave?",
                  content: "All unsaved changes will be lost.",
                  onOk: () => navigate(PATHS.PLAN.PLAN_LIST),
                });
              } else {
                navigate(PATHS.PLAN.PLAN_LIST);
              }
            }}
          />
        </Tooltip>
        <h2 className={style.title}>Add Plan</h2>
      </Flex>
      <Divider />
      <Form
        form={form}
        layout="vertical"
        className={style.form}
        onFinish={handleSubmit}
        initialValues={{ isActive: true }}
      >
        {/* BASIC INFORMATION */}
        <Section
          title="Basic Information"
          subtitle="Enter the basic information for the care plan."
        >
          <Row gutter={16}>
            <Col span={12}>
              <Flex vertical>
                <InfoField
                  label="Process Name"
                  name={addPlanFormFields.processId}
                  options={processFarmOptions}
                  isEditing={true}
                  type="select"
                  hasFeedback={false}
                  onChange={(value) => handleChangeProcess(value)}
                />
                <div
                  style={{ marginTop: "-20px", textAlign: "right" }}
                  onClick={() => {
                    form.setFieldsValue({ [addPlanFormFields.processId]: undefined });
                    handleChangeProcess(undefined);
                  }}>
                  <a style={{ fontSize: "14px", color: "blueviolet", textDecoration: "underline" }}>Clear</a>
                </div>
              </Flex>
            </Col>
            <Col span={12}>
              <InfoField
                label="Growth Stage"
                name={addPlanFormFields.growthStageID}
                rules={RulesManager.getGrowthStageRules()}
                options={growthStageOptions}
                isEditing={!isLockedGrowthStage}
                onChange={(value) => setSelectedGrowthStage(value)}
                type="select"
                multiple
                hasFeedback={false}
              />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Flex vertical>
                <InfoField
                  label="Crop Name"
                  name={addPlanFormFields.cropId}
                  // rules={RulesManager.getCropRules()}
                  options={cropOptions}
                  isEditing={true}
                  type="select"
                  hasFeedback={false}
                  onChange={(value) => {
                    setSelectedCrop(value);
                    form.setFieldsValue({ [addPlanFormFields.listLandPlotOfCrop]: undefined });
                    form.setFieldsValue({ planTargetModel: [] });
                  }}
                />
                <div
                  style={{ marginTop: "-20px", textAlign: "right" }}
                  onClick={() => {
                    setSelectedCrop(null);
                    form.setFieldValue("cropId", undefined);
                    form.setFieldValue("listLandPlotOfCrop", []);
                  }}>
                  <a style={{ fontSize: "14px", color: "blueviolet", textDecoration: "underline" }}>Clear</a>
                </div>
              </Flex>
            </Col>
            <Col span={12}>
              <InfoField
                label="Land Plot"
                name={addPlanFormFields.listLandPlotOfCrop}
                rules={[
                  {
                    validator: (_: any, value: any) => {
                      if (selectedCrop && (!value || value.length === 0)) {
                        return Promise.reject(new Error("Please select at least one Land Plot for the Crop!"));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
                options={landPlotOfCropOptions}
                isEditing={selectedCrop ? true : false}
                type="select"
                multiple
                hasFeedback={false}
              />
            </Col>
          </Row>
          <InfoField
            label="Name"
            name={addPlanFormFields.planName}
            rules={RulesManager.getPlanNameRules()}
            isEditing={true}
            hasFeedback={true}
            placeholder="Enter care plan name"
          />
          <InfoField
            label="Detail"
            name={addPlanFormFields.planDetail}
            isEditing={true}
            hasFeedback={false}
            type="textarea"
            placeholder="Enter care plan details"
          />
          <InfoField
            label="Note"
            name={addPlanFormFields.notes}
            isEditing={true}
            hasFeedback={false}
            type="textarea"
            placeholder="Enter care plan notes"
          />

          <InfoField
            label="Active"
            name={addPlanFormFields.isActive}
            isEditing={true}
            type="switch"
            value={checked}
            hasFeedback={false}
            onChange={(value) => setChecked(value)}
          />
        </Section>

        <Divider className={style.divider} />

        {/* SCHEDULE */}
        <Section title="Schedule" subtitle="Define the schedule for the care plan.">
          <InfoField
            label="Date Range"
            name="dateRange"
            type="dateRange"
            rules={[{ required: true, message: "Please select the date range!" }]}
            isEditing
            onChange={handleDateRangeChange}
          />

          <InfoField
            label="Time Range"
            name="timeRange"
            type="timeRange"
            rules={[{ required: true, message: "Please select the time range!" }]}
            isEditing
          />

          <InfoField
            label="Frequency"
            name={addPlanFormFields.frequency}
            options={frequencyOptions}
            rules={[{ required: true, message: "Please select the frequency!" }]}
            isEditing
            type="select"
            hasFeedback={false}
            onChange={handleFrequencyChange}
          />

          {frequency === "Weekly" && (
            <Form.Item
              label="Select Days of Week"
              rules={[{ required: true, message: "Please select the days of week!" }]}
              validateStatus={dateError ? "error" : ""}
              help={dateError}
            >
              <DaySelector
                onSelectDays={handleWeeklyDaySelection}
                onSave={(days) => handleSaveDays(days, "weekly")}
                selectedDays={dayOfWeek}
                type="weekly"
              />
            </Form.Item>
          )}

          {frequency === "Monthly" && (
            <Form.Item
              label="Select Dates"
              rules={[{ required: true, message: "Please select the dates!" }]}
              validateStatus={dateError ? "error" : ""}
              help={dateError}
            >
              <DaySelector
                onSelectDays={handleMonthlyDaySelection}
                onSave={(days) => handleSaveDays(days, "monthly")}
                selectedDays={dayOfMonth}
                type="monthly"
              />
            </Form.Item>
          )}

          {frequency === "None" && (
            <Form.Item
              label="Select Specific Dates"
              rules={[{ required: true, message: "Please select the dates!" }]}
              validateStatus={dateError ? "error" : ""}
              help={dateError}
            >
              <DatePicker
                format="YYYY-MM-DD"
                multiple
                value={customDates}
                onChange={handleDateChange}
                disabledDate={(current) => current && current < moment().endOf("day")}
              />
            </Form.Item>
          )}
        </Section>

        <Divider className={style.divider} />
        <PlanTarget
          landPlotOptions={landPlots}
          landRows={landRowOptions}
          plants={plantsOptions}
          plantLots={plantLotOptions}
          graftedPlants={graftedPlantsOptions}
          selectedGrowthStage={selectedGrowthStage}
          hasSelectedCrop={selectedCrop ? true : false}
          onClearTargets={() => form.setFieldsValue({ planTargetModel: [] })}
        />

        <Divider className={style.divider} />

        {/* TASK ASSIGNMENT */}
        <Section title="Task Assignment" subtitle="Assign tasks and define work type.">
          <InfoField
            label="Type of Work"
            name={addPlanFormFields.masterTypeId}
            options={processTypeOptions}
            rules={RulesManager.getPlanTypeRules()}
            isEditing={true}
            type="select"
            hasFeedback={false}
          />
          <AssignEmployee
            members={selectedEmployees}
            onAssign={handleAssignMember}
            onReporterChange={handleReporterChange}
            selectedReporter={selectedReporter}
          />
          {errorMessage && <div style={{ color: "red", marginTop: 8 }}>{errorMessage}</div>}
          <Modal
            title="Assign Members"
            open={isModalOpen}
            onOk={handleConfirmAssign}
            onCancel={() => setIsModalOpen(false)}
          >
            <Select
              mode="multiple"
              style={{ width: "100%" }}
              placeholder="Select employees"
              value={selectedIds}
              onChange={setSelectedIds}
              optionLabelProp="label"
            >
              {employee.map((emp) => (
                <Select.Option key={emp.userId} value={emp.userId} label={emp.fullName}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <img
                      src={emp.avatarURL}
                      alt={emp.fullName}
                      style={{ width: 24, height: 24, borderRadius: "50%" }}
                      crossOrigin="anonymous"
                    />
                    <span>{emp.fullName}</span>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Modal>
          <label className={style.createdBy}>
            {" "}
            <span>Created by: </span>
            {authData.fullName}
          </label>
        </Section>

        {/* FORM ACTIONS */}
        <Flex gap={10} justify="end" className={style.btnGroup}>
          <CustomButton label="Clear" isCancel handleOnClick={() => form.resetFields()} />
          <CustomButton label="Add Plan" htmlType="submit" />
        </Flex>
      </Form>
      {isModalVisible && (
        <Modal
          title="Are you sure you want to leave this page?"
          visible={isModalVisible}
          onOk={handleConfirmNavigation}
          onCancel={handleCancelNavigation}
        >
          <p>Every changes will be lost.</p>
        </Modal>
      )}
    </div>
  );
};

export default AddPlan;
