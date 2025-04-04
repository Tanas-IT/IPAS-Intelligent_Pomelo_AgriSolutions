import React, { useState, useEffect, useRef } from "react";
import { Form, Select, Row, Col, Button, Table, message, Input, Modal, DatePicker, Flex, Divider, Image } from "antd";
import { planService, plantLotService, processService } from "@/services";
import { CustomButton, FormFieldModal, InfoField, Loading, Section, Tooltip } from "@/components";
import { fetchProcessesOfFarm, fetchUserInfoByRole, getFarmId, getUserId, isDayInRange, planTargetOptions2, RulesManager } from "@/utils";
import { GetProcessDetail } from "@/payloads/process";
import AssignEmployee from "../AssignEmployee";
import { addPlanFormFields, frequencyOptions, MASTER_TYPE } from "@/constants";
import dayjs, { Dayjs } from "dayjs";
import moment from "moment";
import PlanTarget from "../PlanTarget";
import style from "./AddPlanByProcess.module.scss"
import { useGrowthStageOptions, useLandPlotOptions, useLandRowOptions, useMasterTypeOptions } from "@/hooks";
import Title from "antd/es/skeleton/Title";
import { Icons, Images } from "@/assets";
import { PlanRequest } from "@/payloads";
import TaskAssignmentModal from "./TaskAssignmentModal";
import PlanDetailsTable from "./PlanDetailsTable";
import usePlantOfRowOptions from "@/hooks/usePlantOfRowOptions";
import useGraftedPlantOptions from "@/hooks/useGraftedPlantOptions";
import usePlantLotOptions from "@/hooks/usePlantLotOptions";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes";
import DaySelector from "./DaySelector";

type OptionType<T = string | number> = { value: T; label: string };
type EmployeeType = { fullName: string; avatarURL: string; userId: number };
const { Option } = Select;

const AddPlanByProcess = () => {
    const userId = Number(getUserId());
    const navigate = useNavigate();
    const [planDetailsForm] = Form.useForm();
    const [scheduleForm] = Form.useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [processOptions, setProcessOptions] = useState<OptionType<number>[]>([]);
    const [selectedProcess, setSelectedProcess] = useState<GetProcessDetail>();
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [employee, setEmployee] = useState<EmployeeType[]>([]);
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
    const [dateError, setDateError] = useState<string | null>(null);
    const [frequency, setFrequency] = useState<string>("none");
    const [customDates, setCustomDates] = useState<Dayjs[]>([]); // Frequency: none
    const [dayOfWeek, setDayOfWeek] = useState<number[]>([]); // Frequency: weekly
    const [dayOfMonth, setDayOfMonth] = useState<number[]>([]); // Frequency: monthly
    const [growthStage, setGrowthStage] = useState<number[]>([]);
    const [planTargetType, setPlanTargetType] = useState<number>();
    const [isProcessSelected, setIsProcessSelected] = useState(false);
    const [selectedLandRow, setSelectedLandRow] = useState<number | null>(null);
    const [selectedLandPlot, setSelectedLandPlot] = useState<number | null>(null);
    const { options: growthStageOptions } = useGrowthStageOptions(false);
    const { options: workTypeOptions } = useMasterTypeOptions(MASTER_TYPE.WORK, false);
    const { options: landPlots } = useLandPlotOptions();
    const { options: landRowOptions } = useLandRowOptions(selectedLandPlot);
    const { options: plantsOptions } = usePlantOfRowOptions(selectedLandRow);
    const { options: plantLotsOptions } = usePlantLotOptions();
    const { options: graftedPlantsOptions } = useGraftedPlantOptions(Number(getFarmId()));
    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null); // Lưu planId được chọn
    const [dataSource, setDataSource] = useState<any[]>([]);
    const [initialValues, setInitialValues] = useState<{
        employees: number[];
        reporter: number;
    } | null>(null);
    const [form] = Form.useForm();
    const dateFormat = 'YYYY/MM/DD';
    const timeFormat = 'HH:mm:ss';

    useEffect(() => {
        const fetchProcesses = async () => {
            try {
                setProcessOptions(await fetchProcessesOfFarm(Number(getFarmId()), false));
                setEmployee(await fetchUserInfoByRole("User"));
            } catch (error) {
                console.error("Failed to fetch processes:", error);
            }
        };

        fetchProcesses();
    }, []);

    useEffect(() => {
        if (selectedProcess) {
            form.setFieldsValue({
                processId: selectedProcess.processId,
                processName: selectedProcess.processName,
                processType: selectedProcess.processMasterTypeModel.masterTypeName,
                planTarget: selectedProcess.planTargetInProcess
            });
            const mainListPlan = selectedProcess.listPlanIsSampleTrue || [];

            const subProcessesListPlan = selectedProcess.subProcesses?.flatMap(subProcess => subProcess.listPlanIsSampleTrue || []) || [];

            const combinedListPlan = [...mainListPlan, ...subProcessesListPlan];

            setDataSource(combinedListPlan);
        }
    }, [selectedProcess, form]);

    useEffect(() => {
        if (dataSource && dataSource.length > 0) {
            const initialValues = dataSource.reduce((acc, record) => {
                acc[record.planId] = {
                    planName: record.planName,
                    planNote: record.planNote,
                    planDetail: record.planDetail,
                    masterTypeId: record.masterTypeId,
                    selectedSchedule: record.selectedSchedule,
                    selectedEmployees: record.selectedEmployees,
                };
                return acc;
            }, {});
            planDetailsForm.setFieldsValue(initialValues);
        }
    }, [dataSource, planDetailsForm]);

    const handleProcessChange = async (value: number) => {
        try {
            setIsLoading(true);
            const response = await processService.getProcessDetail(value);
            if (response) {
                setPlanTargetType(response.planTargetInProcess);
                setSelectedProcess(response);
                setIsProcessSelected(true);
            }
            console.log("chi tiet", response);

            setSelectedProcess(response);
        } catch (error) {
            console.error("Failed to fetch process details:", error);
            message.error("Failed to fetch process details. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDateRangeChange = (dates: (Dayjs | null)[] | null) => {
        if (!dates || dates.some(date => date === null)) {
            setDateRange(null);
            setDateError("Please select a valid date range!");
            scheduleForm.setFieldsValue({ dateRange: null });
            return;
        }

        const [startDate, endDate] = dates as [Dayjs, Dayjs];
        setDateRange([startDate, endDate]);
        setDateError(null);
        scheduleForm.setFieldsValue({ dateRange: [startDate, endDate] });

        if (frequency === "None" && customDates.length === 1) {
            Modal.confirm({
                title: "Adjust Date Range",
                content: "You have selected only one custom date. Do you want to adjust the date range to match this date?",
                onOk: async () => {
                    const newDateRange = [customDates[0], customDates[0]] as [Dayjs, Dayjs];
                    scheduleForm.setFieldsValue({ dateRange: newDateRange });
                    await setDateRange(newDateRange);
                },
                onCancel: () => {
                    setCustomDates([]);
                },
            });
        }
    };

    const handleDateChange = (dates: Dayjs[]) => {
        if (!dateRange) {
            setDateError("Please select the date range first!");
            return;
        }
        const [startDate, endDate] = dateRange;
        const validDates = dates.filter((date) => date.isBetween(startDate, endDate, "day", "[]"));

        if (validDates.length === 0) {
            setDateError("Selected dates must be within the date range.");
            return;
        }
        console.log("validDates", validDates);


        setDateError(null);
        setCustomDates(validDates);
        console.log("custom date", customDates);

        if (frequency === "None" && validDates.length === 1) {
            const isDateRangeAdjusted = startDate.isSame(validDates[0], "day") && endDate.isSame(validDates[0], "day");
            if (!isDateRangeAdjusted) {
                Modal.confirm({
                    title: "Adjust Date Rangetttttt",
                    content: "You have selected only one custom date. Do you want to adjust the date range to match this date?",
                    onOk: async () => {
                        const newDateRange = [validDates[0], validDates[0]] as [Dayjs, Dayjs];
                        await setDateRange(newDateRange);
                        scheduleForm.setFieldsValue({ dateRange: newDateRange });
                        scheduleForm.setFieldValue("customDates", [validDates[0]])
                    },
                    onCancel: () => {
                        setCustomDates([]);
                        scheduleForm.setFieldValue("customDates", [])
                    },
                });
            }
        }
    };

    const handleFrequencyChange = (value: string) => {
        setFrequency(value);

        if (dateRange && dateRange[0].isSame(dateRange[1], "day")) {
            Modal.confirm({
                title: "Adjust Date Range",
                content: "The selected date range is too short. Do you want to adjust it?",
                onOk: async () => {
                    const newEndDate = value === "Weekly"
                        ? dateRange[0].add(6, "day")
                        : dateRange[0].add(1, "month");
                    await setDateRange([dateRange[0], newEndDate]);
                },
                onCancel: () => {
                    // Không làm gì
                },
            });
        }
    };

    const handleWeeklyDaySelection = (days: number[]) => {
        setDayOfWeek(days);
    };

    const handleMonthlyDaySelection = (days: number[]) => {
        setDayOfMonth(days);
    };

    const handleSaveDays = async (days: number[], type: "weekly" | "monthly"): Promise<boolean> => {
        if (!dateRange) {
            setDateError("Please select the date range first!");
            return false;
        }
        const [startDate, endDate] = dateRange;

        const validDays = days.filter((day) => isDayInRange(day, startDate, endDate, type));

        if (validDays.length === 0) {
            setDateError(`All selected ${type === "weekly" ? "days" : "dates"} are not within the date range. Please select again.`);
            // scheduleForm.setFieldValue("dayOfWeek", []);
            // scheduleForm.setFieldValue("dayOfMonth", []);
            setDayOfWeek([]);
            setDayOfMonth([]);
            return false;
        }

        // Có ngày không hợp lệ
        if (validDays.length < days.length) {
            setDateError(`Some selected ${type === "weekly" ? "days" : "dates"} are not within the date range. Only valid ${type === "weekly" ? "days" : "dates"} will be saved.`);
            if (type === "weekly") {
                setDayOfWeek(validDays);
                scheduleForm.setFieldValue("dayOfWeek", validDays);
            } else if (type === "monthly") {
                setDayOfMonth(validDays);
                scheduleForm.setFieldValue("dayOfMonth", validDays);
            }
        } else {
            setDateError(null);
        }

        if (validDays.length === 1) {
            const selectedDay = validDays[0];
            let targetDate = startDate.clone();
            if (type === "weekly") {
                while (targetDate.day() !== selectedDay) {
                    targetDate = targetDate.add(1, "day");
                }
            } else if (type === "monthly") {
                targetDate = startDate.date(selectedDay);
            }
            const isDateRangeAdjusted = startDate.isSame(targetDate, "day") && endDate.isSame(targetDate, "day");

            if (!isDateRangeAdjusted) {
                return new Promise((resolve) => {
                    Modal.confirm({
                        title: "Adjust Date Range",
                        content: `You have selected only one ${type === "weekly" ? "day" : "date"}. Do you want to adjust the date range to match this ${type === "weekly" ? "day" : "date"}?`,
                        onOk: async () => {
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
                            await setDateRange(newDateRange);
                            scheduleForm.setFieldsValue({ dateRange: newDateRange });
                            resolve(true);
                        },
                        onCancel: () => {
                            if (type === "weekly") {
                                setDayOfWeek([]);
                                scheduleForm.setFieldValue("dayOfWeek", []);
                                resolve(false);
                            } else if (type === "monthly") {
                                setDayOfMonth([]);
                                scheduleForm.setFieldValue("dayOfMonth", []);
                                resolve(false);
                            }
                        },
                    });
                });
            }
        }

        return true;
    };
    const handleScheduleClick = (record: any) => {
        setIsScheduleModalOpen(true);
        setSelectedPlanId(record.planId);
        console.log("1111111", dataSource);

        const selectedPlan = dataSource.find((plan) => plan.planId === record.planId);
        if (selectedPlan) {
            const schedule = selectedPlan.schedule || {};

            const dateRange = schedule.startDate && schedule.endDate
                ? [dayjs(schedule.startDate), dayjs(schedule.endDate)]
                : null;

            const timeRange = schedule.startTime && schedule.endTime
                ? [dayjs(schedule.startTime, "HH:mm"), dayjs(schedule.endTime, "HH:mm")]
                : null;

            setFrequency(schedule.frequency || null);
            setCustomDates(schedule.customDates || []);
            setDayOfWeek(schedule.dayOfWeek || []);
            setDayOfMonth(schedule.dayOfMonth || []);

            const formValues = {
                dateRange: dateRange,
                timeRange: timeRange,
                frequency: schedule.frequency || null,
                dayOfWeek: schedule.dayOfWeek || [],
                dayOfMonth: schedule.dayOfMonth || [],
                customDates: schedule.customDates || [],
            };

            scheduleForm.setFieldsValue(formValues);
        }
    };

    const handleTaskAssignmentClick = (record: any) => {
        setIsTaskModalOpen(true);
        setSelectedPlanId(record.planId);

        const selectedPlan = dataSource.find((plan) => plan.planId === record.planId);
        console.log("selectedPlan của task", selectedPlan);


        if (selectedPlan) {
            const employees = selectedPlan.listEmployee.map((emp: any) => emp.userId);

            const reporter = selectedPlan.listEmployee.find((emp: any) => emp.isReporter)?.userId || null;

            setInitialValues({
                employees: employees,
                reporter: reporter,
            });
        } else {
            setInitialValues(null);
        }
    };
    const handleSaveSchedule = (values: any, planId: number) => {
        const { dateRange, timeRange, frequency, dayOfWeek, dayOfMonth, customDates } = values;
        console.log("calue", values);

        const [startDate, endDate] = dateRange;
        const [startTime, endTime] = timeRange;
        console.log("DS trc khi update", dataSource);


        const updatedDataSource = dataSource.map((plan) => {
            console.log("dataSource co j", dataSource);

            if (plan.planId === planId) {
                return {
                    ...plan,
                    schedule: {
                        frequency,
                        dayOfWeek: frequency === "Weekly" ? dayOfWeek : [],
                        dayOfMonth: frequency === "Monthly" ? dayOfMonth : [],
                        customDates: frequency === "None" ? customDates : [],
                        startDate: startDate.format("YYYY-MM-DD"),
                        endDate: endDate.format("YYYY-MM-DD"),
                        startTime: startTime.format("HH:mm"),
                        endTime: endTime.format("HH:mm"),
                    },
                };
            }
            return plan;
        });

        setDataSource(updatedDataSource);
        console.log("Updated dataSource after selecting schedule:", updatedDataSource);
    };

    const handleDataSourceChange = (updatedDataSource: any[]) => {
        setDataSource(updatedDataSource);
    };

    const handleSaveEmployees = (employees: any[], planId: number) => {
        const updatedDataSource = dataSource.map((plan) => {
            if (plan.planId === planId) {
                return {
                    ...plan,
                    listEmployee: employees,
                };
            }
            return plan;
        });

        setDataSource(updatedDataSource);
        console.log("Updated dataSource after assigning employees:", updatedDataSource);
    };

    const handleSubmit = async () => {
        try {
            if (dataSource.length === 0) {
                message.error("No plans to submit. Please add at least one plan.");
                return;
            }
            console.log("dataaa source in submit", dataSource);
            const a = form.getFieldValue("planTargetModel");
            console.log("há há", a);


            const payload: PlanRequest[] = dataSource.map((plan) => {
                const startDate = new Date(plan.schedule.startDate);
                const endDate = new Date(plan.schedule.endDate);

                const adjustedStartDate = new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000).toISOString();
                const adjustedEndDate = new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000).toISOString();
                const planTargetModel = [];


                if (planTargetType === 1) {
                    const planTargetModels = form.getFieldValue("planTargetModel");

                    planTargetModels.forEach((target: any) => {
                        const landPlotID = target.landPlotID || undefined;
                        const landRowID = target.landRowID || [];
                        const plantID = target.plantID || [];
                        const unit = target.unit;

                        planTargetModel.push({
                            landPlotID,
                            landRowID,
                            plantID,
                            unit,
                            graftedPlantID: [],
                            plantLotID: [],
                        });
                    });
                } else if (planTargetType === 2) {
                    const plantLotID = form.getFieldValue("plantLot") || [];
                    const unit = "plantLot";

                    planTargetModel.push({
                        landPlotID: undefined,
                        landRowID: [],
                        plantID: [],
                        graftedPlantID: [],
                        plantLotID,
                        unit,
                    });
                } else if (planTargetType === 3) {
                    const graftedPlantID = form.getFieldValue("graftedPlant") || [];
                    const unit = "graftedPlant";

                    planTargetModel.push({
                        landPlotID: undefined,
                        landRowID: [],
                        plantID: [],
                        graftedPlantID,
                        plantLotID: [],
                        unit,
                    });
                }
                console.log("planTargetModel:", planTargetModel);

                return {
                    startDate: adjustedStartDate,
                    endDate: adjustedEndDate,
                    isActive: true,
                    planName: plan.planName,
                    notes: plan.planNote,
                    planDetail: plan.planDetail,
                    frequency: plan.schedule.frequency,
                    assignorId: Number(getUserId()),
                    processId: selectedProcess?.processId || 0,
                    cropId: undefined,
                    growthStageId: growthStage,
                    listLandPlotOfCrop: [],
                    masterTypeId: plan.masterTypeId,
                    dayOfWeek: plan.schedule.dayOfWeek,
                    dayOfMonth: plan.schedule.dayOfMonth,
                    customDates: plan.schedule.customDates,
                    listEmployee: plan.listEmployee,
                    startTime: `${plan.schedule.startTime}:00`,
                    endTime: `${plan.schedule.endTime}:00`,
                    planTargetModel: planTargetModel
                }
            });

            console.log("Payload to submit:", payload);

            const response = await planService.createManyPlans(payload, Number(getFarmId()));
            if (response.statusCode === 200) {
                toast.success(response.message);
                form.resetFields();
                setDataSource([]);
                setSelectedProcess(undefined);
                setGrowthStage([]);
                setPlanTargetType(undefined);
                navigate(`${PATHS.PLAN.PLAN_LIST}?sf=createDate&sd=desc`);
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error("Failed to create plans:", error);
            message.error("Failed to create plans. Please try again later.");
        }
    };

    if (isLoading)
        return (
            <Flex justify="center" align="center" style={{ width: "100%" }}>
                <Loading />
            </Flex>
        );


    return (
        <div className={style.container}>
            <Flex gap={40} align="center">
                <Tooltip title="Back to List">
                    <Icons.back
                        style={{ cursor: "pointer" }}
                        className={style.backIcon}
                        size={20}
                        onClick={() => navigate(PATHS.PLAN.PLAN_LIST)}
                    />
                </Tooltip>
                <h3>Add Plan By Process</h3>
            </Flex>
            <Flex className={style.wrapperDivider}>
                <Divider className={style.divider} />
            </Flex>
            <div className={style.content}>
                <Form form={form} layout="vertical">
                    <Section
                        title={
                            <Flex gap={15}>
                                <Image src={Images.process} width={20} height={20} />
                                <span>Process</span>
                            </Flex>
                        }
                        subtitle="You need to choose process first."
                    >
                        <Row gutter={16} style={{ display: "flex", justifyContent: "center" }}>
                            <InfoField
                                name="processId"
                                label="Select Process"
                                onChange={handleProcessChange}
                                rules={RulesManager.getProcessNameRules()}
                                placeholder="Enter process name"
                                options={processOptions}
                                type="select"
                            />
                        </Row>
                    </Section>
                    <Divider className={style.divider} />

                    {/* General Information */}
                    {selectedProcess && (
                        <>
                            <Section
                                title={
                                    <Flex gap={15}>
                                        <Image src={Images.info} width={20} height={20} />
                                        <span>General Information</span>
                                    </Flex>
                                }
                                subtitle=""
                            >
                                <Row gutter={16}>
                                    <Col span={8}>
                                        <InfoField label="Process Name" value={selectedProcess.processName} name="processName" />
                                    </Col>
                                    <Col span={8}>
                                        <InfoField label="Process Type" value={selectedProcess.processMasterTypeModel.masterTypeName} name="processType" />
                                    </Col>
                                    <Col span={8}>
                                        <InfoField
                                            label="Plan Target"
                                            name="planTarget"
                                            rules={RulesManager.getPlanTargetRules()}
                                            options={planTargetOptions2}
                                            value={selectedProcess.planTargetInProcess}
                                            type="select"
                                        />
                                    </Col>
                                </Row>
                            </Section>
                            <Divider className={style.divider} />
                        </>
                    )}


                    {/* Plan Target */}
                    <Flex vertical>
                        <div style={{ width: "70%", marginLeft: "23%" }}>
                            <InfoField
                                label="Growth Stage Name"
                                name={addPlanFormFields.growthStageID}
                                rules={RulesManager.getStageNameRules()}
                                placeholder="Enter the growth stage name"
                                onChange={(value) => {
                                    // form.setFieldValue("growthStageID")
                                    setGrowthStage(value)
                                }}
                                type="select"
                                options={growthStageOptions}
                                multiple
                                isEditing={isProcessSelected && planTargetType === 1}
                            />
                        </div>
                        {
                            (planTargetType === 2) && (
                                <Section title="Plan Targets" subtitle="Define the targets for the care plan.">
                                    <Row gutter={16} style={{ display: "flex", justifyContent: "center" }}>
                                        <InfoField
                                            name="plantLot"
                                            label="Select Plant Lot"
                                            rules={RulesManager.getProcessNameRules()}
                                            placeholder="Select plant lot"
                                            options={plantLotsOptions}
                                            type="select"
                                            multiple
                                            hasFeedback
                                        />
                                    </Row>
                                </Section>
                            )
                        }
                        {
                            (planTargetType === 3) && (
                                <Section title="Plan Targets" subtitle="Define the targets for the care plan.">
                                    <Row gutter={16} style={{ display: "flex", justifyContent: "center" }}>
                                        <InfoField
                                            name="graftedPlant"
                                            label="Select Grafted Plant"
                                            rules={RulesManager.getProcessNameRules()}
                                            placeholder="Select Grafted Plant"
                                            options={graftedPlantsOptions}
                                            type="select"
                                            hasFeedback
                                            multiple
                                        />
                                    </Row>
                                </Section>
                            )
                        }
                        {
                            (planTargetType === 1 && growthStage && isProcessSelected) && (
                                <PlanTarget
                                    landPlotOptions={landPlots}
                                    landRows={landRowOptions}
                                    plants={plantsOptions}
                                    plantLots={[]}
                                    graftedPlants={[]}
                                    selectedGrowthStage={growthStage}
                                    hasSelectedCrop={growthStage.length > 0 ? false : true}
                                    onClearTargets={() => { }}
                                />
                            )
                        }

                    </Flex>
                    <Divider className={style.divider} />

                    {/* Plan Details Table */}
                    <Form form={planDetailsForm} component={false}>
                        <PlanDetailsTable
                            dataSource={dataSource}
                            onDataSourceChange={handleDataSourceChange}
                            onSaveEmployees={handleSaveEmployees}
                            onScheduleClick={handleScheduleClick}
                            onTaskAssignmentClick={handleTaskAssignmentClick}
                            workTypeOptions={workTypeOptions}
                        />
                    </Form>
                    <Divider className={style.divider} />

                    {/* Schedule Modal */}
                    <Modal
                        key={selectedPlanId}
                        title="Set Schedule"
                        visible={isScheduleModalOpen}
                        onOk={() => setIsScheduleModalOpen(false)}
                        onCancel={() => setIsScheduleModalOpen(false)}
                        footer={null}
                        width={800}
                    >
                        <Form
                            form={scheduleForm}
                            onFinish={(values) => {
                                console.log("bấm save");

                                handleSaveSchedule(values, selectedPlanId ?? 1);
                                setIsScheduleModalOpen(false);
                            }}
                        >
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
                                    name={addPlanFormFields.dayOfWeek}
                                    validateStatus={dateError ? "error" : ""}
                                    help={dateError}
                                >
                                    <DaySelector
                                        onSelectDays={handleWeeklyDaySelection}
                                        onSave={async (days) => {
                                            const isSuccess = await handleSaveDays(days, "weekly");
                                            return isSuccess;
                                        }}
                                        selectedDays={dayOfWeek}
                                        type="weekly"
                                    />
                                </Form.Item>
                            )}

                            {frequency === "Monthly" && (
                                <Form.Item
                                    label="Select Dates"
                                    name={addPlanFormFields.dayOfMonth}
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
                                    name={addPlanFormFields.customDates}
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
                            <Form.Item>
                                <Button type="primary" htmlType="submit">
                                    Save
                                </Button>
                            </Form.Item>
                        </Form>
                    </Modal>

                    {/* Task Assignment Modal */}
                    <TaskAssignmentModal
                        key={selectedPlanId}
                        visible={isTaskModalOpen}
                        onCancel={() => setIsTaskModalOpen(false)}
                        onSave={handleSaveEmployees}
                        employees={employee}
                        selectedPlanId={selectedPlanId}
                        initialValues={initialValues}
                    />
                    <Flex justify="flex-end">
                        <CustomButton label="Add" handleOnClick={handleSubmit} disabled={!selectedProcess} />
                    </Flex>
                </Form>
            </div>
        </div>
    );
};

export default AddPlanByProcess;