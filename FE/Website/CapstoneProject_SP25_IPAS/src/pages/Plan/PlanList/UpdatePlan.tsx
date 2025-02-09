import React, { useState, useEffect } from "react";
import {
    Form,
    Input,
    DatePicker,
    TimePicker,
    Select,
    Switch,
    Button,
    Row,
    Col,
    Divider,
    Modal,
    Flex,
} from "antd";
import moment from "moment";
import { CustomButton, Section, Tooltip } from "@/components";
import style from "./PlanList.module.scss";
import { Dayjs } from "dayjs";
import DaySelector from "./DaySelector";
import AssignEmployee from "./AssignEmployee";
import { Icons } from "@/assets";
import { useNavigate, useParams } from "react-router-dom";
import { PATHS } from "@/routes";
import { GetPlan } from "@/payloads/plan";
import { defaultPlanData } from "@/utils";

const { Option } = Select;
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

const allEmployees = [
    { id: 1, name: "Alice", avatar: "https://tse1.mm.bing.net/th?id=OIP.LvEl7bxftxDEvSkWiuA6rwHaHa&pid=Api&P=0&h=220" },
    { id: 2, name: "Bob", avatar: "https://i.pravatar.cc/40?img=2" },
    { id: 3, name: "Charlie", avatar: "https://i.pravatar.cc/40?img=3" },
    { id: 4, name: "David", avatar: "https://i.pravatar.cc/40?img=4" },
    { id: 5, name: "Emma", avatar: "https://i.pravatar.cc/40?img=5" },
];

const UpdatePlan = () => {
    const [form] = Form.useForm();
    const [frequency, setFrequency] = useState<string>("none");
    const [customDates, setCustomDates] = useState<[Dayjs, Dayjs] | null>(null);
    const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
    const [responsibleBy, setResponsibleBy] = useState<typeof allEmployees>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [daysOfMonth, setDaysOfMonth] = useState<number[]>([]);
    const [planData, setPlanData] = useState<GetPlan>(defaultPlanData);
    const navigate = useNavigate();
    const { id } = useParams();
    const [isFormDirty, setIsFormDirty] = useState(false);

    useEffect(() => {
        if (planData) {
            const startDate = moment(planData.startDate);
            const endDate = moment(planData.endDate);

            const startTime = moment(planData.startTime, 'HH:mm:ss');
            const endTime = moment(planData.endTime, 'HH:mm:ss');
            console.log("Plan Data:", planData);
            

            form.setFieldsValue({
                ...planData,
                date: [startDate, endDate],
                timeRange: [startTime, endTime],
                responsibleBy: planData.responsibleBy ? [planData.responsibleBy] : [],
                daysOfWeek: planData.daysOfWeek,
                daysOfMonth: planData.daysOfMonth,
                customDates: planData.customDates ? planData.customDates.map((date: Date) => moment(date)) : [],
            });
            console.log("Form Data:", form.getFieldsValue());
            

            setFrequency(planData.frequency);
            setResponsibleBy(allEmployees);
        }
    }, [id, form, planData]);

    const handleAssignMember = () => setIsModalOpen(true);

    const handleConfirmAssign = () => {
        setResponsibleBy(allEmployees.filter(m => selectedIds.includes(m.id)));
        setIsModalOpen(false);
    };

    const handleFrequencyChange = (value: string) => {
        setFrequency(value);
    };

    const handleDateChange = (dates: [Dayjs, Dayjs] | null) => {
        setCustomDates(dates);
    };

    const handleWeeklyDaySelection = (days: number[]) => {
        setDaysOfWeek(days);
    };

    const handleMonthlyDaySelection = (days: number[]) => {
        setDaysOfMonth(days);
    };

    const handleSubmit = (values: any) => {
        const { date, timeRange } = values;

        const startDate = date?.[0]?.toISOString();
        const endDate = date?.[1]?.toISOString();
        const startTime = new Date(timeRange[0]).toISOString().substring(11, 19);
        const endTime = new Date(timeRange[1]).toISOString().substring(11, 19);
        console.log("Submitted Data:",
            {
                planName: values.planName,
                planDetail: values.planDetail,
                cropId: values.cropId,
                landPlot: values.landPlot,
                processId: values.processId,
                growthStageId: values.growthStageId,
                frequency: values.frequency,
                isActive: values.isActive,
                masterTypeId: values.masterTypeId,
                customDates,
                responsibleBy,
                daysOfWeek,
                daysOfMonth,
                startDate,
                endDate,
                startTime,
                endTime
            });
        setIsFormDirty(false);
        // call API 
    };
    console.log(daysOfWeek);
    

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
                        }} />
                </Tooltip>
                <h2 className={style.title}>Update Plan</h2>
            </Flex>
            <Divider />
            <Form
                form={form}
                layout="vertical"
                className={style.form}
                onFinish={handleSubmit}
                onValuesChange={() => setIsFormDirty(true)}
            >
                {/* BASIC INFORMATION */}
                <Section title="Basic Information" subtitle="Enter the basic information for the care plan.">
                    <Form.Item label="Name" name="planName" rules={[{ required: true, message: "Please enter the name!" }]}>
                        <Input placeholder="Enter care plan name" />
                    </Form.Item>
                    <Form.Item label="Detail" name="planDetail">
                        <Input.TextArea rows={3} placeholder="Enter details" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Crop" name="cropId">
                                <Select placeholder="Select crop">
                                    <Option value="pomelo">Pomelo</Option>
                                    <Option value="other">Other</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Land Plot" name="landPlot" rules={[{ required: true, message: "Please select the land plot!" }]}>
                                <Select placeholder="Select Land Plot">
                                    <Option value="plot1">Plot 1</Option>
                                    <Option value="plot2">Plot 2</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Process" name="processId" rules={[{ required: true, message: "Please select the process!" }]}>
                                <Select placeholder="Select process">
                                    <Option value="pruning">Pruning</Option>
                                    <Option value="watering">Watering</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Growth Stage" name="growthStageId" rules={[{ required: true, message: "Please select the growth stage!" }]}>
                                <Select placeholder="Select Growth Stage">
                                    <Option value="early">Early</Option>
                                    <Option value="mature">Mature</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item label="Active" name="isActive" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Section>

                <Divider className={style.divider} />

                {/* SCHEDULE */}
                <Section title="Schedule" subtitle="Define the schedule for the care plan.">
                    <Form.Item label="Date Range" name="date" rules={[{ required: true, message: "Please select the date range!" }]}>
                        <RangePicker style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item label="Time Range" name="timeRange" rules={[{ required: true, message: "Please select the time range!" }]}>
                        <TimePicker.RangePicker style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item label="Frequency" name="frequency" rules={[{ required: true, message: "Please select the frequency!" }]}>
                        <Select placeholder="Select frequency" onChange={handleFrequencyChange}>
                            <Option value="none">None</Option>
                            <Option value="daily">Daily</Option>
                            <Option value="weekly">Weekly</Option>
                            <Option value="monthly">Monthly</Option>
                        </Select>
                    </Form.Item>

                    {frequency === "weekly" && (
                        <Form.Item label="Select Days of Week" rules={[{ required: true, message: "Please select the days of week!" }]}>
                            <DaySelector onSelectDays={handleWeeklyDaySelection} selectedDays={daysOfWeek} type="weekly" />
                        </Form.Item>
                    )}

                    {frequency === "monthly" && (
                        <Form.Item label="Select Dates" rules={[{ required: true, message: "Please select the dates!" }]}>
                            <DaySelector onSelectDays={handleMonthlyDaySelection} selectedDays={daysOfMonth} type="monthly" />
                        </Form.Item>
                    )}

                    {frequency === "none" && (
                        <Form.Item label="Select Specific Dates" rules={[{ required: true, message: "Please select the dates!" }]}>
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

                {/* TASK ASSIGNMENT */}
                <Section title="Task Assignment" subtitle="Assign tasks and define work type.">
                    <Form.Item label="Type of Work" name="masterTypeId" rules={[{ required: true, message: "Please select the type of work!" }]}>
                        <Select placeholder="Select type of work">
                            <Option value="planting">Planting</Option>
                            <Option value="watering">Watering</Option>
                            <Option value="harvesting">Harvesting</Option>
                        </Select>
                    </Form.Item>
                    <AssignEmployee members={responsibleBy.filter(emp => selectedIds.includes(emp.id))} onAssign={handleAssignMember} />
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
                        >
                            {allEmployees.map((employee) => (
                                <Option key={employee.id} value={employee.id}>
                                    {employee.name}
                                </Option>
                            ))}
                        </Select>
                    </Modal>
                </Section>

                {/* FORM ACTIONS */}
                <Flex gap={10} justify="end" className={style.btnGroup}>
                    <CustomButton
                        label="Clear"
                        isCancel
                        handleOnClick={() => form.resetFields()}
                    />
                    <CustomButton label="Update Plan" htmlType="submit" />
                </Flex>
            </Form>
        </div>
    );
};

export default UpdatePlan;
