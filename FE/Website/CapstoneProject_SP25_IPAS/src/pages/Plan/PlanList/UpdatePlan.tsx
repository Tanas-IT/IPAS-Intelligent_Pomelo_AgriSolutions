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
import dayjs, { Dayjs } from "dayjs";
import DaySelector from "./DaySelector";
import AssignEmployee from "./AssignEmployee";
import { Icons } from "@/assets";
import { useNavigate, useParams } from "react-router-dom";
import { PATHS } from "@/routes";
import { useGrowthStageOptions, useLocalStorage, useMasterTypeOptions, useUnsavedChangesWarning } from "@/hooks";
import {
    fetchGrowthStageOptions,
    fetchProcessesOfFarm,
    fetchTypeOptionsByName,
    fetchUserInfoByRole,
    getFarmId,
    getUserId,
    isDayInRange,
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
import PlanTarget from "./PlanTarget";
import useLandRowOptions from "@/hooks/useLandRowOptions";
import useLandPlotOptions from "@/hooks/useLandPlotOptions";
import useGraftedPlantOptions from "@/hooks/useGraftedPlantOptions";
import usePlantOfRowOptions from "@/hooks/usePlantOfRowOptions";
import isBetween from "dayjs/plugin/isBetween";
import { GetPlan } from "@/payloads/plan";

dayjs.extend(isBetween);

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

const UpdatePlan = () => {
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
    // const [landPlotOptions, setLandPlotOptions] = useState<OptionType<number>[]>([]);
    const [processFarmOptions, setProcessFarmOptions] = useState<OptionType<number>[]>([]);
    // const [growthStageOptions, setGrowthStageOptions] = useState<OptionType<number | string>[]>([]);
    const [workTypeOptions, setWorkTypeOptions] = useState<OptionType<number | string>[]>([]);
    const [employee, setEmployee] = useState<EmployeeType[]>([]);
    const [assignorId, setAssignorId] = useState<number>();
    const [frequency, setFrequency] = useState<string>("none");
    const [customDates, setCustomDates] = useState<Dayjs[]>([]); // Frequency: none
    const [dayOfWeek, setDayOfWeek] = useState<number[]>([]); // Frequency: weekly
    const [dayOfMonth, setDayOfMonth] = useState<number[]>([]); // Frequency: monthly
    const [selectedLandRow, setSelectedLandRow] = useState<number | null>(null);
    const [selectedGrowthStage, setSelectedGrowthStage] = useState<number[]>([]);
    console.log("các id", selectedGrowthStage);


    const { options: processTypeOptions } = useMasterTypeOptions(MASTER_TYPE.WORK, false);
    const { options: growthStageOptions } = useGrowthStageOptions(false);
    const { options: landPlots } = useLandPlotOptions();
    const { options: landRowOptions } = useLandRowOptions(selectedLandPlot);
    const { options: plantsOptions } = usePlantOfRowOptions(selectedLandRow);
    const { options: graftedPlantsOptions } = useGraftedPlantOptions(farmId);

    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
    const [dateError, setDateError] = useState<string | null>(null);
    console.log("dateRange", dateRange);
    const { id } = useParams();
    const [planData, setPlanData] = useState<GetPlan>();



    const [planTargets, setPlanTargets] = useState<
        {
            landPlotID?: number;
            landRowID?: number;
            plantID?: number;
        }[]
    >([]);

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

    const handleRemovePlanTarget = (index: number) => {
        setPlanTargets((prev) => prev.filter((_, i) => i !== index));
    };
    // const [landRows, setLandRows] = useState<OptionType<number>[]>([]);
    const [selectedOptions, setSelectedOptions] = useState<OptionType[]>([]);

    const [plants, setPlants] = useState<OptionType<number>[]>([]);

    const { isModalVisible, handleCancelNavigation, handleConfirmNavigation } =
        useUnsavedChangesWarning(isFormDirty);

    const handleLandPlotChange = (landPlotId: number) => {
        setSelectedLandPlot(landPlotId);
    };


    const handleLandRowChange = (landRowId: number) => {
        setSelectedLandRow(landRowId);
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
            // chỉ giữ lại ngày hợp lệ
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
        console.log("bấm add");

        const { dateRange, timeRange, planTargetModel } = values;
        const startDate = new Date(dateRange?.[0]);
        const endDate = new Date(dateRange?.[1]);
        console.log("planTargetModel", planTargetModel);


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
            startTime: startTime,
            endTime: endTime,
            planTargetModel: planTargetModel.map((target: any) => ({
                landPlotID: target.landPlotID ?? 0,
                landRowID: target.landRowID ?? [],
                plantID: target.plantID ?? [],
                graftedPlantID: target.graftedPlantID ?? [],
                plantLotID: target.plantLotID ?? [],
            })),
        };
        console.log("planData", planData);


        const result = await planService.addPlan(planData);

        if (result.statusCode === 200) {
            toast.success(result.message);
            form.resetFields();
        } else {
            toast.error(result.message);
        }

        setIsFormDirty(false);
    };
    console.log("id", id);


    useEffect(() => {
        const fetchData = async () => {
            setProcessFarmOptions(await fetchProcessesOfFarm(farmId, true));
            setEmployee(await fetchUserInfoByRole("User"));

            if (id) {
                const result = await planService.getPlanDetail(id);
                if (result) {
                    setPlanData(result);
                    const startDate = result.startDate ? moment(result.startDate) : null;
                    const endDate = result.endDate ? moment(result.endDate) : null;
                    const dateRange = [result.startDate, result.endDate];

                    setFrequency(result.frequency || "None");

                    const parsedDayOfMonth = result.dayOfMonth ? JSON.parse(result.dayOfMonth) : [];
                    setDayOfMonth(parsedDayOfMonth);

                    setSelectedIds(result.listEmployee?.map((emp) => emp.userId) || []);

                    // const parsedCustomDates = result.customDates
                    //     ? result.customDates.map((date: string) => moment(date))
                    //     : [];
                    // setCustomDates(parsedCustomDates);

                    console.log("dateRange:", dateRange);



                    form.setFieldsValue({
                        planId: result.planId,
                        status: result.status,
                        planName: result.planName,
                        planCode: result.planCode,
                        createDate: result.createDate,
                        dateRange: startDate && endDate ? [startDate, endDate] : [],
                        isActive: result.isActive,
                        notes: result.notes,
                        planDetail: result.planDetail,
                        frequency: result.frequency,
                        pesticideName: result.pesticideName,
                        progress: result.progress,
                        maxVolume: result.maxVolume,
                        minVolume: result.minVolume,
                        isDelete: result.isDelete,
                        plantNames: result.plantNames || [],
                        landPlotNames: result.landPlotNames || [],
                        assignorName: result.assignorName,
                        processName: result.processName,
                        cropName: result.cropName,
                        graftedPlantName: result.graftedPlantName || [],
                        growthStageName: result.growthStageName || [],
                        plantLotNames: result.plantLotNames || [],
                        rowIndexs: result.rowIndexs || [],
                        masterTypeName: result.masterTypeName,
                        avatarOfAssignor: result.avatarOfAssignor,
                        listReporter: result.listReporter || [],
                        listEmployee: result.listEmployee || [],
                        dayOfMonth: result.dayOfMonth ? JSON.parse(result.dayOfMonth) : [],
                        startTime: moment(result.startTime, "HH:mm:ss"),
                        endTime: moment(result.endTime, "HH:mm:ss"),
                        listWorkLog: result.listWorkLog || [],
                        planTargetModels: result.planTargetModels || [],
                        date: [moment(result.startDate), moment(result.endDate)],
                        timeRange: [moment(result.startTime, "HH:mm:ss"), moment(result.endTime, "HH:mm:ss")],
                        customDates: result.customDates ? result.customDates.map((date: string) => moment(date)) : [],
                    });

                    console.log("result", result);
                }
            } else {
                console.log("ko co id");
            }
        };

        fetchData();
    }, [id, form]);



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
                <h2 className={style.title}>Update Plan</h2>
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
                    // console.log("Changed:", changedValues);
                    // console.log("All Values:", allValues);
                }}
            >
                {/* BASIC INFORMATION */}
                <Section
                    title="Basic Information"
                    subtitle="Enter the basic information for the care plan."
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <InfoField
                                label="Process Name"
                                name={addPlanFormFields.processId}
                                options={processFarmOptions}
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
                                onChange={(value) => setSelectedGrowthStage(value)}
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
                        <RangePicker style={{ width: "100%" }} onChange={handleDateRangeChange} />
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
                                selectedDays={form.getFieldValue("dayOfMonth")}
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
                    plantLots={[]}
                    graftedPlants={graftedPlantsOptions}
                    onLandPlotChange={handleLandPlotChange}
                    onLandRowChange={handleLandRowChange}
                    selectedGrowthStage={selectedGrowthStage}
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

export default UpdatePlan;
