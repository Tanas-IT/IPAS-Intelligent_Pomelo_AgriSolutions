import React, { useState, useEffect } from "react";
import { Form, Select, Row, Col, Button, Table, message, Input, Modal, DatePicker } from "antd";
import { processService } from "@/services";
import { FormFieldModal, InfoField, Section } from "@/components";
import { fetchProcessesOfFarm, getFarmId, getUserId, isDayInRange } from "@/utils";
import { GetProcessDetail } from "@/payloads/process";
import AssignEmployee from "./AssignEmployee";
import { addPlanFormFields, frequencyOptions } from "@/constants";
import { Dayjs } from "dayjs";
import DaySelector from "./DaySelector";
import moment from "moment";
import PlanTarget from "./PlanTarget";
import style from "./AddPlanByProcess.module.scss"

type OptionType<T = string | number> = { value: T; label: string };
type EmployeeType = { fullName: string; avatarURL: string; userId: number };
const { Option } = Select;

const AddPlanByProcess = () => {
    const userId = Number(getUserId());
    const [assignorId, setAssignorId] = useState<number>();
    const [isModalOpen, setIsModalOpen] = useState(false);
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
            } catch (error) {
                console.error("Failed to fetch processes:", error);
                message.error("Failed to fetch processes. Please try again later.");
            }
        };

        fetchProcesses();
    }, []);

    const handleProcessChange = async (value: number) => {
        try {
            // Gọi API để lấy chi tiết process
            const response = await processService.getProcessDetail(value);
            console.log("chi tiet", response);
            
            setSelectedProcess(response);
        } catch (error) {
            console.error("Failed to fetch process details:", error);
            message.error("Failed to fetch process details. Please try again later.");
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

    return (
        <div className={style.container}>
            <Form form={form} layout="vertical">
                <Row gutter={16}>
                    <Col span={8}>
                        <FormFieldModal
                            direction="row"
                            label="Select Process:"
                            onChange={handleProcessChange}
                            placeholder="Enter process name"
                            options={processOptions}
                            type="select"
                        />
                    </Col>
                </Row>

                {/* General Information */}
                {selectedProcess && (
                    <Section title="General Information" subtitle="co lennnn">
                        <Row gutter={16}>
                            <Col span={8}>
                                <InfoField label="Process Name" value={selectedProcess.processName} name="processName" />
                            </Col>
                            <Col span={8}>
                                <InfoField label="Process Type" value={selectedProcess.processMasterTypeModel.masterTypeName} name="processType" />
                            </Col>
                        </Row>
                    </Section>
                )}

                {/* Plan Target */}
                <PlanTarget
                    landPlotOptions={[]}
                    landRows={[]}
                    plants={[]}
                    plantLots={[]}
                    graftedPlants={[]}
                    selectedGrowthStage={selectedProcess?.processGrowthStageModel.growthStageId ? [selectedProcess.processGrowthStageModel.growthStageId] : []}
                    hasSelectedCrop={false}
                    onClearTargets={() => { }}
                />

                {/* Plan Details Table */}
                <Table
                    columns={[
                        {
                            title: "Plan Name", dataIndex: "planName", key: "planName", render: (text, record) => (
                                <Form.Item name={[record.planId, "planName"]} rules={[{ required: true }]}>
                                    <Input placeholder="Enter plan name" />
                                </Form.Item>
                            )
                        },
                        {
                            title: "Plan Note", dataIndex: "planNote", key: "planNote", render: (text, record) => (
                                <Form.Item name={[record.planId, "planNote"]}>
                                    <Input placeholder="Enter plan note" />
                                </Form.Item>
                            )
                        },
                        {
                            title: "Plan Detail", dataIndex: "planDetail", key: "planDetail", render: (text, record) => (
                                <Form.Item name={[record.planId, "planDetail"]}>
                                    <Input placeholder="Enter plan detail" />
                                </Form.Item>
                            )
                        },
                        {
                            title: "Type of Work", dataIndex: "typeOfWork", key: "typeOfWork", render: (text, record) => (
                                <Form.Item name={[record.planId, "typeOfWork"]}>
                                    <Select placeholder="Select type of work">
                                        {processOptions.map((option) => (
                                            <Option key={option.value} value={option.value}>
                                                {option.label}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            )
                        },
                        {
                            title: "Schedule", dataIndex: "schedule", key: "schedule", render: (text, record) => (
                                <Button onClick={() => setIsScheduleModalOpen(true)}>Set Schedule</Button>
                            )
                        },
                        {
                            title: "Task Assignment", dataIndex: "taskAssignment", key: "taskAssignment", render: (text, record) => (
                                <Button onClick={() => setIsTaskModalOpen(true)}>Assign Task</Button>
                            )
                        },
                    ]}
                    dataSource={selectedProcess?.listPlan || []}
                    rowKey="planId"
                />

                {/* Schedule Modal */}
                <Modal
                    title="Set Schedule"
                    visible={isScheduleModalOpen}
                    onOk={() => setIsScheduleModalOpen(false)}
                    onCancel={() => setIsScheduleModalOpen(false)}
                >
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
                </Modal>

                {/* Task Assignment Modal */}
                <Modal
                    title="Assign Task"
                    visible={isTaskModalOpen}
                    onOk={() => setIsTaskModalOpen(false)}
                    onCancel={() => setIsTaskModalOpen(false)}
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
                </Modal>
            </Form>
        </div>
    );
};

export default AddPlanByProcess;