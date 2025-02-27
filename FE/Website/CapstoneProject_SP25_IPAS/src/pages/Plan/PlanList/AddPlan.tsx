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
  Checkbox,
  Modal,
  Flex,
  Button,
} from "antd";
import moment, { Moment } from "moment";
import { CustomButton, InfoField, Section, Tooltip } from "@/components";
import style from "./PlanList.module.scss";
import { Dayjs } from "dayjs";
import DaySelector from "./DaySelector";
import AssignEmployee from "./AssignEmployee";
import { Icons } from "@/assets";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes";
import { useLocalStorage, useMasterTypeOptions, useUnsavedChangesWarning } from "@/hooks";
import {
  fetchGrowthStageOptions,
  fetchProcessesOfFarm,
  fetchTypeOptionsByName,
  fetchUserInfoByRole,
  getFarmId,
  getUserId,
  RulesManager,
} from "@/utils";
import { addPlanFormFields, frequencyOptions, MASTER_TYPE } from "@/constants";
import {
  cropService,
  landPlotService,
  landRowService,
  planService,
  plantService,
} from "@/services";
import { toast } from "react-toastify";
import { PlanRequest } from "@/payloads/plan/requests/PlanRequest";

const { RangePicker } = DatePicker;

interface CarePlanForm {
  name: string;
  detail?: string;
  startDate: moment.Moment;
  endDate: moment.Moment;
  startTime?: moment.Moment;
  endTime?: moment.Moment;
  frequency: string;
  typeOfWork: string;
  crop: string;
  process: string;
  growthStage: string;
  active: boolean;
}

type OptionType<T = string | number> = { value: T; label: string };
type EmployeeType = { fullName: string; avatarURL: string; userId: number };

const AddPlan = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const userId = Number(getUserId());
  const { getAuthData } = useLocalStorage();
  const authData = getAuthData();
  const farmId = Number(getFarmId());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedLandPlot, setSelectedLandPlot] = useState<number | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<EmployeeType[]>([]);
  const [selectedReporter, setSelectedReporter] = useState<number | null>(null);
  const [cropOptions, setCropOptions] = useState<OptionType<string>[]>([]);
  const [landPlotOptions, setLandPlotOptions] = useState<OptionType<number>[]>([]);
  const [processFarmOptions, setProcessFarmOptions] = useState<OptionType<number>[]>([]);
  const [growthStageOptions, setGrowthStageOptions] = useState<OptionType<number | string>[]>([]);
  const [workTypeOptions, setWorkTypeOptions] = useState<OptionType<number | string>[]>([]);
  const [employee, setEmployee] = useState<EmployeeType[]>([]);
  const [assignorId, setAssignorId] = useState<number>();
  const [frequency, setFrequency] = useState<string>("none");
  const [customDates, setCustomDates] = useState<Dayjs[]>([]); // Frequency: none
  const [dayOfWeek, setDayOfWeek] = useState<number[]>([]); // Frequency: weekly
  const [dayOfMonth, setDayOfMonth] = useState<number[]>([]); // Frequency: monthly
  const [selectedLandRow, setSelectedLandRow] = useState<number | null>(null);
  const { options: processTypeOptions } = useMasterTypeOptions(MASTER_TYPE.WORK, false);
  // Thêm state để lưu trữ các mục tiêu của kế hoạch
  const [planTargets, setPlanTargets] = useState<
    {
      landPlotID?: number;
      landRowID?: number;
      plantID?: number;
    }[]
  >([]);

  // Thêm hàm để thêm mục tiêu vào danh sách
  const handleAddPlanTarget = (target: {
    landPlotID?: number;
    landRowID?: number;
    plantID?: number;
  }) => {
    setPlanTargets((prev) => [...prev, target]);
  };

  // Thêm hàm để xóa mục tiêu khỏi danh sách
  const handleRemovePlanTarget = (index: number) => {
    setPlanTargets((prev) => prev.filter((_, i) => i !== index));
  };
  const [landRows, setLandRows] = useState<OptionType<number>[]>([]);
  const [plants, setPlants] = useState<OptionType<number>[]>([]);

  const { isModalVisible, handleCancelNavigation, handleConfirmNavigation } =
    useUnsavedChangesWarning(isFormDirty);

  useEffect(() => {
    const fetchLandRows = async (landPlotId: number) => {
      const rows = await landRowService.getLandRows(landPlotId);
      // setLandRows(rows.map(row => ({
      //     value: row.landRowId,
      //     label: row.landRowCode,
      // })));
    };

    const fetchPlants = async (landRowId: number) => {
      const plants = await plantService.getPlants(landRowId);
      // setPlants(plants.map(plant => ({
      //     value: plant.id,
      //     label: plant.name,
      // })));
    };

    if (selectedLandPlot) {
      fetchLandRows(selectedLandPlot);
    }

    if (selectedLandRow) {
      fetchPlants(selectedLandRow);
    }
  }, [selectedLandPlot, selectedLandRow]);

  const handleLandPlotChange = async (landPlotId: number) => {
    setSelectedLandPlot(landPlotId);
    setCropOptions([]);

    if (landPlotId) {
      const crops = await cropService.getCropsOfLandPlotForSelect(landPlotId);
      setCropOptions(
        crops.map((crop) => ({
          value: crop.cropId,
          label: crop.cropName,
        })),
      );
    }
  };

  const handleReporterChange = (userId: number) => {
    setSelectedReporter(userId);
  };

  const handleAssignMember = () => setIsModalOpen(true);

  const handleConfirmAssign = () => {
    setAssignorId(userId);
    setSelectedEmployees(employee.filter((m) => selectedIds.includes(Number(m.userId))));
    setIsModalOpen(false);
  };

  const handleDateChange = (dates: Dayjs[]) => {
    setCustomDates(dates);
  };

  const handleWeeklyDaySelection = (days: number[]) => {
    setDayOfWeek(days);
  };

  const handleMonthlyDaySelection = (days: number[]) => {
    setDayOfMonth(days);
  };

  const handleSubmit = async (values: any) => {
    console.log("bấm add");

    const { dateRange, timeRange, planTargetModel } = values;
    const startDate = new Date(dateRange?.[0]);
    const endDate = new Date(dateRange?.[1]);

    const adjustedStartDate = new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000);
    const adjustedEndDate = new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000);

    const startTime = timeRange?.[0]?.toDate().toLocaleTimeString();
    const endTime = timeRange?.[1]?.toDate().toLocaleTimeString();

    if (assignorId === undefined) {
      toast.error("Assignor ID is required.");
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
      startTime,
      endTime,
      planTargetModel: planTargetModel.map((target: any) => ({
        landPlotID: target.landPlotID,
        landRowID: target.landRowID,
        plantID: target.plantID,
      })),
    };

    const result = await planService.addPlan(planData);

    if (result.statusCode === 200) {
      toast.success(result.message);
      form.resetFields();
    } else {
      toast.error(result.message);
    }

    setIsFormDirty(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchLandPlotOptions();
      setProcessFarmOptions(await fetchProcessesOfFarm(farmId));
      setGrowthStageOptions(await fetchGrowthStageOptions(farmId));
      // setWorkTypeOptions(await fetchTypeOptionsByName("Work", true));
      setEmployee(await fetchUserInfoByRole("Employee"));
    };

    fetchData();
  }, []);
  console.log("growthStageOptions", growthStageOptions);

  const fetchLandPlotOptions = async () => {
    const landPlots = await landPlotService.getLandPlotsOfFarmForSelect(farmId);
    const formattedLandPlotOptions = landPlots.map((landPlot) => ({
      value: landPlot.id,
      label: landPlot.name,
    }));
    setLandPlotOptions(formattedLandPlotOptions);
  };

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
                  title: "Bạn có chắc chắn muốn rời đi?",
                  content: "Tất cả thay đổi chưa lưu sẽ bị mất.",
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
        // onValuesChange={() => setIsFormDirty(true)}
        initialValues={{ isActive: true }}
        onValuesChange={(changedValues, allValues) => {
          console.log("Changed:", changedValues);
          console.log("All Values:", allValues);
        }}
      >
        {/* BASIC INFORMATION */}
        <Section
          title="Basic Information"
          subtitle="Enter the basic information for the care plan."
        >
          <InfoField
            label="Name"
            name={addPlanFormFields.planName}
            rules={RulesManager.getPlanNameRules()}
            isEditing={true}
            hasFeedback={false}
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
            name={addPlanFormFields.planNote}
            isEditing={true}
            hasFeedback={false}
            type="textarea"
            placeholder="Enter care plan notes"
          />
          <Row gutter={16}>
            <Col span={12}>
              <InfoField
                label="Land Plot"
                rules={RulesManager.getLandPlotRules()}
                name={addPlanFormFields.landPlotId}
                options={landPlotOptions}
                isEditing={true}
                type="select"
                onChange={handleLandPlotChange}
                hasFeedback={false}
              />
            </Col>
            <Col span={12}>
              <InfoField
                label="Crop"
                name={addPlanFormFields.cropId}
                options={cropOptions}
                isEditing={true}
                rules={RulesManager.getCropRules()}
                type="select"
                hasFeedback={false}
              />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <InfoField
                label="Process Name"
                name={addPlanFormFields.processId}
                options={processFarmOptions}
                rules={RulesManager.getProcessRules()}
                isEditing={true}
                type="select"
                hasFeedback={false}
              />
            </Col>
            <Col span={12}>
              <InfoField
                label="Growth Stage"
                name={addPlanFormFields.growthStageID}
                options={growthStageOptions}
                isEditing={true}
                rules={RulesManager.getGrowthStageRules()}
                type="select"
                hasFeedback={false}
              />
            </Col>
          </Row>
          <InfoField
            label="Active"
            name={addPlanFormFields.isActive}
            isEditing={true}
            type="switch"
            hasFeedback={false}
          />
        </Section>

        <Divider className={style.divider} />

        {/* SCHEDULE */}
        <Section title="Schedule" subtitle="Define the schedule for the care plan.">
          <Form.Item
            label="Date Range"
            name="dateRange"
            rules={[{ required: true, message: "Please select the date range!" }]}
          >
            <RangePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Time Range"
            name="timeRange"
            rules={[{ required: true, message: "Please select the time range!" }]}
          >
            <TimePicker.RangePicker style={{ width: "100%" }} />
          </Form.Item>
          <InfoField
            label="Frequency"
            name={addPlanFormFields.frequency}
            options={frequencyOptions}
            isEditing
            type="select"
            hasFeedback={false}
            onChange={(value) => setFrequency(value)}
          />

          {frequency === "Weekly" && (
            <Form.Item
              label="Select Days of Week"
              rules={[{ required: true, message: "Please select the days of week!" }]}
            >
              <DaySelector
                onSelectDays={handleWeeklyDaySelection}
                selectedDays={dayOfWeek}
                type="weekly"
              />
            </Form.Item>
          )}

          {frequency === "Monthly" && (
            <Form.Item
              label="Select Dates"
              rules={[{ required: true, message: "Please select the dates!" }]}
            >
              <DaySelector
                onSelectDays={handleMonthlyDaySelection}
                selectedDays={dayOfMonth}
                type="monthly"
              />
            </Form.Item>
          )}

          {frequency === "None" && (
            <Form.Item
              label="Select Specific Dates"
              rules={[{ required: true, message: "Please select the dates!" }]}
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

        <Section title="Plan Targets" subtitle="Define the targets for the care plan.">
          <Form.List name="planTargetModel">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row key={key} gutter={16} align="middle">
                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        name={[name, "landPlotID"]}
                        label="Land Plot"
                        rules={[{ required: true, message: "Please select a land plot!" }]}
                      >
                        <Select placeholder="Select Land Plot">
                          {landPlotOptions.map((plot) => (
                            <Select.Option key={plot.value} value={plot.value}>
                              {plot.label}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        name={[name, "landRowID"]}
                        label="Land Row"
                        rules={[{ required: true, message: "Please select a land row!" }]}
                      >
                        <Select placeholder="Select Land Row">
                          {landRows.map((row) => (
                            <Select.Option key={row.value} value={row.value}>
                              {row.label}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        name={[name, "plantID"]}
                        label="Plant"
                        rules={[{ required: true, message: "Please select a plant!" }]}
                      >
                        <Select placeholder="Select Plant">
                          {plants.map((plant) => (
                            <Select.Option key={plant.value} value={plant.value}>
                              {plant.label}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={2}>
                      <Button type="link" danger onClick={() => remove(name)}>
                        Remove
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
        </Section>

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
          title="Bạn có chắc chắn muốn rời đi?"
          visible={isModalVisible}
          onOk={handleConfirmNavigation}
          onCancel={handleCancelNavigation}
        >
          <p>Tất cả thay đổi chưa lưu sẽ bị mất.</p>
        </Modal>
      )}
    </div>
  );
};

export default AddPlan;
