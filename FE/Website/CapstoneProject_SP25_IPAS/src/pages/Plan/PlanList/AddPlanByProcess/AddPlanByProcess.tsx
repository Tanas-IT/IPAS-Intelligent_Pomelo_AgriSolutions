import React, { useState, useEffect } from "react";
import { Form, Select, Row, Col, Button, Table, message, Input, Modal, DatePicker, Flex, Divider, Image } from "antd";
import { planService, processService } from "@/services";
import { CustomButton, FormFieldModal, InfoField, Loading, Section } from "@/components";
import { fetchProcessesOfFarm, fetchUserInfoByRole, getFarmId, getUserId, isDayInRange, RulesManager } from "@/utils";
import { GetProcessDetail } from "@/payloads/process";
import AssignEmployee from "../AssignEmployee";
import { addPlanFormFields, frequencyOptions, MASTER_TYPE } from "@/constants";
import { Dayjs } from "dayjs";
import DaySelector from "../DaySelector";
import moment from "moment";
import PlanTarget from "../PlanTarget";
import style from "./AddPlanByProcess.module.scss"
import { useGrowthStageOptions, useMasterTypeOptions } from "@/hooks";
import Title from "antd/es/skeleton/Title";
import { Images } from "@/assets";
import { PlanRequest } from "@/payloads";
import TaskAssignmentModal from "./TaskAssignmentModal";
import PlanDetailsTable from "./PlanDetailsTable";

type OptionType<T = string | number> = { value: T; label: string };
type EmployeeType = { fullName: string; avatarURL: string; userId: number };
const { Option } = Select;

const AddPlanByProcess = () => {
    const userId = Number(getUserId());
    const [planDetailsForm] = Form.useForm();
    const [scheduleForm] = Form.useForm();
    const [employeeForm] = Form.useForm();
    const [assignorId, setAssignorId] = useState<number>();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [processOptions, setProcessOptions] = useState<OptionType<number>[]>([]);
    const [selectedProcess, setSelectedProcess] = useState<GetProcessDetail>();
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [selectedEmployees, setSelectedEmployees] = useState<EmployeeType[]>([]);
    const [employee, setEmployee] = useState<EmployeeType[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
    const [dateError, setDateError] = useState<string | null>(null);
    const [selectedReporter, setSelectedReporter] = useState<number | null>(null);
    const [frequency, setFrequency] = useState<string>("none");
    const [customDates, setCustomDates] = useState<Dayjs[]>([]); // Frequency: none
    const [dayOfWeek, setDayOfWeek] = useState<number[]>([]); // Frequency: weekly
    const [dayOfMonth, setDayOfMonth] = useState<number[]>([]); // Frequency: monthly
    const [growthStage, setGrowthStage] = useState<number[]>([]);
    const [planTargetType, setPlanTargetType] = useState<number>();
    const [isProcessSelected, setIsProcessSelected] = useState(false);
    const { options: growthStageOptions } = useGrowthStageOptions(false);
    const { options: workTypeOptions } = useMasterTypeOptions(MASTER_TYPE.WORK, false);
    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null); // Lưu planId được chọn
    const [dataSource, setDataSource] = useState<any[]>([]);
    const handleReporterChange = (userId: number) => {
        setSelectedReporter(userId);
    };
    const handleConfirmAssign = () => {
        setAssignorId(userId);
        // if (selectedIds.length === 0) {
        //   setErrorMessage("Please select at least one employee.");
        //   return;
        // }

        setSelectedEmployees(employee.filter((m) => selectedIds.includes(Number(m.userId))));
        setIsModalOpen(false);
    };

    const handleAssignMember = () => setIsModalOpen(true);
    const [form] = Form.useForm();

    useEffect(() => {
        const fetchProcesses = async () => {
            try {
                setProcessOptions(await fetchProcessesOfFarm(Number(getFarmId()), false));
                setEmployee(await fetchUserInfoByRole("User"));
            } catch (error) {
                console.error("Failed to fetch processes:", error);
                message.error("Failed to fetch processes. Please try again later.");
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
            });
            setDataSource(selectedProcess.listPlan || []);
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
    console.log("planDetailsForm", planDetailsForm.getFieldsValue);
    

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

        setDateError(null);
        setCustomDates(validDates);
        if (frequency === "None" && validDates.length === 1) {
            const isDateRangeAdjusted = startDate.isSame(validDates[0], "day") && endDate.isSame(validDates[0], "day");
            if (!isDateRangeAdjusted) {
                Modal.confirm({
                    title: "Adjust Date Rangetttttt",
                    content: "You have selected only one custom date. Do you want to adjust the date range to match this date?",
                    onOk: () => {
                        const newDateRange = [validDates[0], validDates[0]] as [Dayjs, Dayjs];
                        setDateRange(newDateRange);
                        form.setFieldsValue({ dateRange: newDateRange });
                    },
                    onCancel: () => {
                        setCustomDates([]);
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
            return false;
        }

        // Có ngày không hợp lệ
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
                            resolve(true);
                        },
                        onCancel: () => {
                            if (type === "weekly") {
                                setDayOfWeek([]);
                                resolve(false);
                            } else if (type === "monthly") {
                                setDayOfMonth([]);
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
    };

    const handleTaskAssignmentClick = (record: any) => {
        setIsTaskModalOpen(true);
        setSelectedPlanId(record.planId);
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
    console.log("dataaa source", dataSource);


    const handleSubmit = async () => {
        try {
            if (dataSource.length === 0) {
                message.error("No plans to submit. Please add at least one plan.");
                return;
            }
    
            const payload = dataSource.map((plan) => ({
                startDate: plan.schedule.startDate,
                endDate: plan.schedule.endDate,
                isActive: true,
                planName: plan.planName,
                notes: plan.planNote,
                planDetail: plan.planDetail,
                frequency: plan.schedule.frequency,
                assignorId: 0,
                processId: 0,
                cropId: 0,
                growthStageId: [],
                listLandPlotOfCrop: [],
                masterTypeId: plan.masterTypeId,
                dayOfWeek: plan.schedule.dayOfWeek,
                dayOfMonth: plan.schedule.dayOfMonth,
                customDates: plan.schedule.customDates,
                listEmployee: plan.listEmployee,
                startTime: plan.schedule.startTime,
                endTime: plan.schedule.endTime,
                planTargetModel: plan.planTargetModel || [],
            }));
    
            console.log("Payload to submit:", payload);
    
            const response = await planService.createManyPlans(payload);
            console.log("Plans created successfully:", response);
            message.success("Plans created successfully!");
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
            <h3>Add Plan By Process</h3>
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
                                </Row>
                            </Section>
                            <Divider className={style.divider} />
                        </>
                    )}


                    {/* Plan Target */}
                    <Flex vertical>
                        <div style={{ width: "30%", marginLeft: "23%" }}>
                            <InfoField
                                label="Growth Stage Name"
                                name={addPlanFormFields.growthStageID}
                                rules={RulesManager.getStageNameRules()}
                                placeholder="Enter the growth stage name"
                                onChange={(value) => setGrowthStage(value)}
                                type="select"
                                options={growthStageOptions}
                                multiple
                                isEditing={isProcessSelected}
                            />
                        </div>
                        {
                            (growthStage && isProcessSelected) && (
                                <PlanTarget
                                    landPlotOptions={[]}
                                    landRows={[]}
                                    plants={[]}
                                    plantLots={[]}
                                    graftedPlants={[]}
                                    selectedGrowthStage={growthStage}
                                    hasSelectedCrop={(planTargetType === 2 || planTargetType === 3) ? true : false}
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
                        title="Set Schedule"
                        visible={isScheduleModalOpen}
                        onOk={() => setIsScheduleModalOpen(false)}
                        onCancel={() => setIsScheduleModalOpen(false)}
                        footer={null}
                    >
                        <Form
                            form={scheduleForm}
                            onFinish={(values) => {
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
                                    name={addPlanFormFields.dayOfWeek}
                                    rules={[{ required: true, message: "Please select the days of week!" }]}
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
                        visible={isTaskModalOpen}
                        onCancel={() => setIsTaskModalOpen(false)}
                        onSave={handleSaveEmployees} // Truyền hàm xử lý khi nhấn "Save"
                        employees={employee} // Danh sách nhân viên
                        selectedPlanId={selectedPlanId} // PlanId được chọn
                    />
                    {/* <Modal
                        title="Assign Task"
                        visible={isTaskModalOpen}
                        onOk={() => setIsTaskModalOpen(false)}
                        onCancel={() => setIsTaskModalOpen(false)}
                    >
                        <Form
                            form={employeeForm}
                            onFinish={(values) => {
                                handleSaveSchedule(values, selectedPlanId ?? 1);
                                setIsScheduleModalOpen(false);
                            }}
                        >
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
                        </Form>
                    </Modal> */}
                    <Flex justify="flex-end">
                        <CustomButton label="Add" handleOnClick={handleSubmit} />
                    </Flex>
                </Form>
            </div>
        </div>
    );
};

export default AddPlanByProcess;