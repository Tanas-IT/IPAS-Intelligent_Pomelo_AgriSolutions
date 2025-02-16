import React, { useEffect, useState } from "react";
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
    Checkbox,
    Modal,
    Flex,
} from "antd";
import moment, { Moment } from "moment";
import { CustomButton, FormFieldModal, InfoField, Section, Tooltip } from "@/components";
import style from "./PlanList.module.scss";
import { Dayjs } from "dayjs";
import DaySelector from "./DaySelector";
import AssignEmployee from "./AssignEmployee";
import { Icons } from "@/assets";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes";
import { useLocalStorage, useStyle, useUnsavedChangesWarning } from "@/hooks";
import { getFarmId, getUserId, RulesManager } from "@/utils";
import { addPlanFormFields, frequencyOptions } from "@/constants";
import { cropService, landPlotService } from "@/services";

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
    { userId: "1", fullName: "Alice", avatarURL: "" },
    { userId: "2", fullName: "Bob", avatarURL: "" },
    { userId: "3", fullName: "Charlie", avatarURL: "" },
    { userId: "4", fullName: "David", avatarURL: "" },
    { userId: "5", fullName: "Emma", avatarURL: "" },
];

const AddPlan = () => {
    const [form] = Form.useForm();
    const [frequency, setFrequency] = useState<string>("none");
    const [customDates, setCustomDates] = useState<[Dayjs, Dayjs] | null>(null); //chọn ngày cho frequency: none
    const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]); //chọn thứ cho frequency: weekly
    const [responsibleBy, setResponsibleBy] = useState<typeof allEmployees>([]);
    const [assignorId, setAssignorId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [daysOfMonth, setDaysOfMonth] = useState<number[]>([]);
    const [cropOptions, setCropOptions] = useState<{ value: string, label: string }[]>([]);
    const [landPlotOptions, setLandPlotOptions] = useState<{ value: string, label: string }[]>([]);
    const navigate = useNavigate();
    const userId = getUserId();
    const { getAuthData } = useLocalStorage();
    const authData = getAuthData();
    const [isFormDirty, setIsFormDirty] = useState(false);
    const farmId = getFarmId();

    const {
        isModalVisible,
        handleCancelNavigation,
        handleConfirmNavigation
    } = useUnsavedChangesWarning(isFormDirty);

    const handleFormChange = () => {
        setIsFormDirty(true);
    };


    const handleAssignMember = () => setIsModalOpen(true);

    const handleConfirmAssign = () => {
        setAssignorId(userId);
        setResponsibleBy(allEmployees.filter(m => selectedIds.includes(m.userId)));
        setIsModalOpen(false);
    };

    const handleFrequencyChange = (value: string) => {
        setFrequency(value);
        // setSelectedDays([]);
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
                assignorId,
                responsibleBy,
                daysOfWeek,
                daysOfMonth,
                startDate,
                endDate,
                startTime,
                endTime
            });
        setIsFormDirty(false);
    };

    useEffect(() => {
        fetchCropOptions();
        fetchLandPlotOptions();
    }, []);

    const fetchCropOptions = async () => {
        const crops = await cropService.getCropsOfFarmForSelect(farmId);
        console.log("crops", crops);

        const formattedCropOptions = crops.map((crop) => ({
            value: crop.cropId,
            label: crop.cropName,
        }));
        setCropOptions(formattedCropOptions);

    };

    const fetchLandPlotOptions = async () => {
        const landPlots = await landPlotService.getLandPlotsOfFarmForSelect(farmId);
        console.log("landPlots", landPlots);

        const formattedLandPlotOptions = landPlots.map((landPlot) => ({
            value: landPlot.landPlotId,
            label: landPlot.landPlotName,
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
                        }} />
                </Tooltip>
                <h2 className={style.title}>Add Plan</h2>
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

                    <Form.Item label="Note" name="notes">
                        <Input placeholder="Enter plan notes" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            {/* <SelectInfo
                                label="Crop"
                                // rules={RulesManager.getCropRules()}
                                name={addPlanFormFields.cropId}
                                options={cropOptions}
                                isEditing={true}
                            /> */}
                            <InfoField
                                label="Land Plot"
                                rules={RulesManager.getLandPlotRules()}
                                name={addPlanFormFields.landPlotId}
                                options={landPlotOptions}
                                isEditing={true}
                                type="select"
                            />
                        </Col>
                        <Col span={12}>
                            {/* <SelectInfo
                                label="Land Plot"
                                rules={RulesManager.getLandPlotRules()}
                                name={addPlanFormFields.landPlotId}
                                options={landPlotOptions}
                                isEditing={true}
                            /> */}
                            <InfoField
                                label="Crop"
                                name={addPlanFormFields.cropId}
                                options={cropOptions}
                                isEditing={true}
                                type="select"
                            />
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Process Name" name="processId" rules={[{ required: true, message: "Please select the process!" }]}>
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
                    <Form.Item label="Date Range" name="dateRange" rules={[{ required: true, message: "Please select the date range!" }]}>
                        <RangePicker style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item label="Time Range" name="timeRange" rules={[{ required: true, message: "Please select the time range!" }]}>
                        <TimePicker.RangePicker style={{ width: "100%" }} />
                    </Form.Item>
                    {/* <SelectInfo
                        label="Frequency"
                        name={addPlanFormFields.frequency}
                        options={frequencyOptions}
                        isEditing={true}
                        defaultValue="none"
                    /> */}

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
                            <Option value="planting">Watering</Option>
                            <Option value="watering">Fertilizing</Option>
                            <Option value="pruning">Pruning</Option>
                            <Option value="harvesting">Harvesting</Option>
                            <Option value="grafting">Grafting</Option>
                        </Select>
                    </Form.Item>
                    <AssignEmployee members={responsibleBy} onAssign={handleAssignMember} />
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
                                <Option key={employee.userId} value={employee.userId}>
                                    {employee.fullName}
                                </Option>
                            ))}
                        </Select>
                    </Modal>
                    <label className={style.createdBy}> <span>Created by: </span>{authData.fullName}</label>
                </Section>

                {/* FORM ACTIONS */}
                <Flex gap={10} justify="end" className={style.btnGroup}>
                    <CustomButton
                        label="Clear"
                        isCancel
                        handleOnClick={() => form.resetFields()}
                    />
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
