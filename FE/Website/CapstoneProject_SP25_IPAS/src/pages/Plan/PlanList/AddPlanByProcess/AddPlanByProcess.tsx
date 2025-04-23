import React, { useState, useEffect, useRef } from "react";
import { Form, Select, Row, Col, Button, Table, message, Input, Modal, DatePicker, Flex, Divider, Image } from "antd";
import { planService, plantLotService, processService, worklogService } from "@/services";
import { CustomButton, FormFieldModal, InfoField, Loading, Section, Tooltip } from "@/components";
import { fetchProcessesOfFarm, fetchUserInfoByRole, getFarmId, getUserId, isDayInRange, planTargetOptions2, RulesManager } from "@/utils";
import { GetProcessDetail } from "@/payloads/process";
import AssignEmployee from "../AssignEmployee";
import { addPlanFormFields, frequencyOptions, MASTER_TYPE } from "@/constants";
import dayjs, { Dayjs } from "dayjs";
import moment from "moment";
import PlanTarget from "../PlanTarget";
import style from "./AddPlanByProcess.module.scss";
import { useGrowthStageOptions, useLandPlotOptions, useLandRowOptions, useMasterTypeOptions } from "@/hooks";
import Title from "antd/es/skeleton/Title";
import { Icons, Images } from "@/assets";
import { Plan, PlanRequest, SubProcess, DataSourceNode, PlanNode, SubProcessNode, ProcessNode } from "@/payloads";
import TaskAssignmentModal from "./TaskAssignmentModal";
import PlanDetailsTable from "./PlanDetailsTable";
import usePlantOfRowOptions from "@/hooks/usePlantOfRowOptions";
import useGraftedPlantOptions from "@/hooks/useGraftedPlantOptions";
import usePlantLotOptions from "@/hooks/usePlantLotOptions";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes";
import DaySelector from "./DaySelector";
import { EmployeeWithSkills } from "@/payloads/worklog";

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
    const [employee, setEmployee] = useState<EmployeeWithSkills[]>([]);
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
    const [dateError, setDateError] = useState<string | null>(null);
    const [frequency, setFrequency] = useState<string>("None");
    const [customDates, setCustomDates] = useState<Dayjs[]>([]);
    const [dayOfWeek, setDayOfWeek] = useState<number[]>([]);
    const [dayOfMonth, setDayOfMonth] = useState<number[]>([]);
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
    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
    const [dataSource, setDataSource] = useState<DataSourceNode[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<EmployeeWithSkills[]>([]);
    const [isDaySelectorSaved, setIsDaySelectorSaved] = useState<boolean>(false);
    const [initialValues, setInitialValues] = useState<{
        employees: number[];
        reporter: number;
    } | null>(null);
    const [form] = Form.useForm();
    const dateFormat = "YYYY/MM/DD";
    const timeFormat = "HH:mm:ss";

    useEffect(() => {
        const fetchProcesses = async () => {
            try {
                setProcessOptions(await fetchProcessesOfFarm(Number(getFarmId()), false));
                const response = await worklogService.getEmployeesByWorkSkill(Number(getFarmId()));
                if (response.statusCode === 200) {
                    setEmployee(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch processes:", error);
            }
        };

        fetchProcesses();
    }, []);

    const createSubProcessNode = (
        subProcess: SubProcess,
        selectedPlanMap: Map<number, any>,
        depth: number = 1,
        maxDepth: number = 3
    ): SubProcessNode | null => {
        if (depth > maxDepth) return null;

        const planChildren: PlanNode[] = subProcess.plans.map((plan: Plan) => {
            const selectedPlan = selectedPlanMap.get(plan.planId) || {};
            return {
                key: `plan-${plan.planId}`,
                type: "plan",
                name: plan.planName,
                planId: plan.planId,
                planName: plan.planName,
                planDetail: plan.planDetail || "",
                planNote: plan.planNote || "",
                masterTypeId: selectedPlan.masterTypeId || null,
                listEmployee: selectedPlan.listEmployee || [],
                schedule: selectedPlan.schedule || {},
            };
        });

        const subProcessChildren: SubProcessNode[] = subProcess.children
            .map((child) => createSubProcessNode(child, selectedPlanMap, depth + 1, maxDepth))
            .filter((child): child is SubProcessNode => child !== null);

        const children = [...planChildren, ...subProcessChildren];
        if (children.length === 0) return null;

        return {
            key: `subProcess-${subProcess.subProcessID}`,
            type: "subProcess",
            name: subProcess.subProcessName,
            subProcessId: subProcess.subProcessID,
            subProcessOrder: subProcess.order || null,
            children,
        };
    };

    useEffect(() => {
        const fetchPlans = async () => {
            if (!selectedProcess?.processId) return;

            try {
                const response = await planService.getPlanByProcessId(selectedProcess.processId);
                if (response.statusCode === 200 && response.data) {
                    const { processName, plans, subProcesses } = response.data;

                    const mainListPlan = selectedProcess.listPlanIsSampleTrue || [];
                    const subProcessesListPlan = selectedProcess.subProcesses?.flatMap(
                        (subProcess) => subProcess.listPlanIsSampleTrue || []
                    ) || [];
                    const combinedListPlan = [...mainListPlan, ...subProcessesListPlan];
                    const selectedPlanMap = new Map(combinedListPlan.map((p: any) => [p.planId, p]));

                    const processNode: ProcessNode = {
                        key: `process-${selectedProcess.processId}`,
                        type: "process",
                        name: processName,
                        children: plans.map((plan: Plan) => {
                            const selectedPlan = selectedPlanMap.get(plan.planId) || {};
                            return {
                                key: `plan-${plan.planId}`,
                                type: "plan",
                                name: plan.planName,
                                planId: plan.planId,
                                planName: plan.planName,
                                planDetail: plan.planDetail || "",
                                planNote: plan.planNote || "",
                                masterTypeId: selectedPlan.masterTypeId || null,
                                listEmployee: selectedPlan.listEmployee || [],
                                schedule: selectedPlan.schedule || {},
                            };
                        }),
                    };

                    const subProcessNodes = subProcesses
                        .map((subProcess) => createSubProcessNode(subProcess, selectedPlanMap))
                        .filter((node): node is SubProcessNode => node !== null);

                    const newDataSource: DataSourceNode[] = [processNode, ...subProcessNodes];

                    setDataSource(newDataSource);

                    form.setFieldsValue({
                        processId: selectedProcess.processId,
                        processName: selectedProcess.processName,
                        processType: selectedProcess.processMasterTypeModel?.masterTypeName,
                        planTarget: selectedProcess.planTargetInProcess,
                    });
                } else {
                    console.error("Failed to fetch plans:", response.message);
                }
            } catch (error) {
                console.error("Error fetching plans by process ID:", error);
            }
        };

        fetchPlans();
    }, [selectedProcess, form]);

    useEffect(() => {
        if (dataSource && dataSource.length > 0) {
            const initialValues: {
                [key: number]: { planName: string; planNote: string; planDetail: string; masterTypeId: number | null };
            } = {};
            const collectPlans = (items: DataSourceNode[]) => {
                items.forEach((item) => {
                    if (item.type === "plan") {
                        initialValues[item.planId] = {
                            planName: item.planName,
                            planNote: item.planNote,
                            planDetail: item.planDetail,
                            masterTypeId: item.masterTypeId,
                        };
                    }
                    if ("children" in item) {
                        collectPlans(item.children);
                    }
                });
            };
            collectPlans(dataSource);
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
        } catch (error) {
            console.error("Failed to fetch process details:", error);
            toast.error("Failed to fetch process details. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDateRangeChange = (dates: (Dayjs | null)[] | null) => {
        if (!dates || dates.some((date) => date === null)) {
            setDateRange(null);
            setDateError("Please select a valid date range!");
            scheduleForm.setFieldsValue({ dateRange: null });
            if (frequency === "Weekly") {
                setDayOfWeek([]);
                scheduleForm.setFieldValue("dayOfWeek", []);
            }
            return;
        }

        const [startDate, endDate] = dates as [Dayjs, Dayjs];
        setDateRange([startDate, endDate]);
        setDateError(null);
        scheduleForm.setFieldsValue({ dateRange: [startDate, endDate] });
        if (frequency === "Weekly") {
            setDayOfWeek([]);
            scheduleForm.setFieldValue("dayOfWeek", []);
        }

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
                    scheduleForm.setFieldValue("customDates", []);
                },
            });
        }
    };

    const handleDateChange = (dates: Dayjs[]) => {
        if (!dateRange) {
            setDateError("Please select the date range first!");
            setCustomDates([]);
            scheduleForm.setFieldValue("customDates", []);
            return;
        }

        const [startDate, endDate] = dateRange;

        setCustomDates(dates);
        scheduleForm.setFieldValue("customDates", dates);

        const validDates = dates.filter((date) => date.isBetween(startDate, endDate, "day", "[]"));

        if (validDates.length === 0) {
            setDateError("Selected dates must be within the date range.");
            setCustomDates([]);
            scheduleForm.setFieldValue("customDates", []);
            return;
        }

        setDateError(null);

        if (frequency === "None") {
            if (dates.length === 1) {
                const isDateRangeAdjusted = startDate.isSame(dates[0], "day") && endDate.isSame(dates[0], "day");
                if (!isDateRangeAdjusted) {
                    Modal.confirm({
                        title: "Adjust Date Range",
                        content: "You have selected only one custom date. Do you want to adjust the date range to match this date?",
                        onOk: async () => {
                            const newDateRange = [dates[0], dates[0]] as [Dayjs, Dayjs];
                            await setDateRange(newDateRange);
                            scheduleForm.setFieldValue("dateRange", newDateRange);
                        },
                        onCancel: () => {
                            setCustomDates([]);
                            scheduleForm.setFieldValue("customDates", []);
                        },
                    });
                }
            } else if (dates.length > 1) {
                const minDate = dates.reduce((min, date) => (date.isBefore(min) ? date : min), dates[0]);
                const maxDate = dates.reduce((max, date) => (date.isAfter(max) ? date : max), dates[0]);
                const isDateRangeAdjusted = startDate.isSame(minDate, "day") && endDate.isSame(maxDate, "day");
                if (!isDateRangeAdjusted) {
                    Modal.confirm({
                        title: "Adjust Date Range",
                        content: `The selected dates range from ${minDate.format("YYYY-MM-DD")} to ${maxDate.format("YYYY-MM-DD")}. Do you want to adjust the date range to match these dates?`,
                        onOk: async () => {
                            const newDateRange = [minDate, maxDate] as [Dayjs, Dayjs];
                            await setDateRange(newDateRange);
                            scheduleForm.setFieldValue("dateRange", newDateRange);
                        },
                        onCancel: () => {
                            setCustomDates([]);
                            scheduleForm.setFieldValue("customDates", []);
                        },
                    });
                }
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
                    const newEndDate = value === "Weekly" ? dateRange[0].add(6, "day") : dateRange[0].add(1, "month");
                    await setDateRange([dateRange[0], newEndDate]);
                },
                onCancel: () => { },
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
        console.log("daterange", dateRange);


        const validDays = days.filter((day) => {
            const isValid = isDayInRange(day, startDate, endDate, type);
            return isValid;
        });

        const invalidDays = days.filter(day => !validDays.includes(day));

        if (validDays.length === 0) {
            setDateError(`All selected ${type === "weekly" ? "days" : "dates"} are not within the date range. Please select again.`);
            if (type === "weekly") {
                setDayOfWeek([]);
                scheduleForm.setFieldValue("dayOfWeek", []);
            } else {
                setDayOfMonth([]);
                scheduleForm.setFieldValue("dayOfMonth", []);
            }
            setIsDaySelectorSaved(false);
            return false;
        }

        if (invalidDays.length > 0) {
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
            if (type === "weekly") {
                setDayOfWeek(validDays);
                scheduleForm.setFieldValue("dayOfWeek", validDays);
            } else if (type === "monthly") {
                setDayOfMonth(validDays);
                scheduleForm.setFieldValue("dayOfMonth", validDays);
            }
        }

        setIsDaySelectorSaved(true);

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
                            setIsDaySelectorSaved(true);
                            resolve(true);
                        },
                        onCancel: () => {
                            if (type === "weekly") {
                                setDayOfWeek([]);
                                scheduleForm.setFieldValue("dayOfWeek", []);
                            } else if (type === "monthly") {
                                setDayOfMonth([]);
                                scheduleForm.setFieldValue("dayOfMonth", []);
                            }
                            setIsDaySelectorSaved(false);
                            resolve(false);
                        },
                    });
                });
            }
        }

        return true;
    };

    const handleScheduleClick = (record: PlanNode) => {
        setDateError(null);
        setIsScheduleModalOpen(true);
        setSelectedPlanId(record.planId);
        setIsDaySelectorSaved(false);

        const findPlan = (items: DataSourceNode[]): PlanNode | undefined => {
            for (const item of items) {
                if (item.type === "plan" && item.planId === record.planId) {
                    return item;
                }
                if ("children" in item) {
                    const found = findPlan(item.children);
                    if (found) return found;
                }
            }
        };

        const selectedPlan = findPlan(dataSource);
        if (selectedPlan) {
            const schedule = selectedPlan.schedule || {};

            const dateRange = schedule.startDate && schedule.endDate
                ? [dayjs(schedule.startDate), dayjs(schedule.endDate)]
                : null;

            const timeRange = schedule.startTime && schedule.endTime
                ? [dayjs(schedule.startTime, "HH:mm"), dayjs(schedule.endTime, "HH:mm")]
                : null;
            setDateRange(dateRange as [Dayjs, Dayjs] | null);
            setFrequency(schedule.frequency || "None");
            setCustomDates(schedule.customDates?.map((date: string) => dayjs(date)) || []);
            setDayOfWeek(schedule.dayOfWeek || []);
            setDayOfMonth(schedule.dayOfMonth || []);

            const formValues = {
                dateRange: dateRange,
                timeRange: timeRange,
                frequency: schedule.frequency || "None",
                dayOfWeek: schedule.dayOfWeek || [],
                dayOfMonth: schedule.dayOfMonth || [],
                customDates: schedule.customDates?.map((date: string) => dayjs(date)) || [],
            };

            scheduleForm.setFieldsValue(formValues);
        }
    };

    const handleTaskAssignmentClick = async (record: PlanNode) => {
        setSelectedPlanId(record.planId);

        const findPlan = (items: DataSourceNode[]): PlanNode | undefined => {
            for (const item of items) {
                if (item.type === "plan" && item.planId === record.planId) {
                    return item;
                }
                if ("children" in item) {
                    const found = findPlan(item.children);
                    if (found) return found;
                }
            }
        };

        const selectedPlan = findPlan(dataSource);
        if (selectedPlan) {
            const employees = selectedPlan.listEmployee.map((emp: any) => emp.userId);
            const reporter = selectedPlan.listEmployee.find((emp: any) => emp.isReporter)?.userId || null;

            setInitialValues({
                employees,
                reporter,
            });

            if (selectedPlan.masterTypeId !== null && selectedPlan.masterTypeId !== undefined) {
                try {
                    const response = await worklogService.getEmployeesByWorkSkill(Number(getFarmId()), selectedPlan.masterTypeId);
                    if (response.statusCode === 200) {
                        setFilteredEmployees(response.data);
                    } else {
                        toast.error("Failed to fetch employees for this work type.");
                        return;
                    }
                } catch (error) {
                    toast.error("Failed to fetch employees. Please try again later.");
                    return;
                }
            } else {
                Modal.error({
                    title: "No Plan Selected",
                    content: "Please select a plan before assigning employees.",
                    okText: "Got it",
                    okButtonProps: {
                        style: {
                            backgroundColor: "#52c41a",
                            color: "#fff",
                        },
                    },
                });

                return;
            }

            setIsTaskModalOpen(true);
        } else {
            setInitialValues(null);
            toast.error("Selected plan not found.");
        }
    };

    const handleSaveSchedule = (values: any, planId: number) => {
        const { dateRange, timeRange, frequency, dayOfWeek, dayOfMonth, customDates } = values;
        const [startDate, endDate] = dateRange || [null, null];
        const [startTime, endTime] = timeRange || [null, null];

        const updateChildren = (items: DataSourceNode[]): DataSourceNode[] => {
            return items.map((item) => {
                if (item.type === "plan" && item.planId === planId) {
                    return {
                        ...item,
                        schedule: {
                            frequency: frequency || "None",
                            dayOfWeek: frequency === "Weekly" ? dayOfWeek : [],
                            dayOfMonth: frequency === "Monthly" ? dayOfMonth : [],
                            customDates: frequency === "None" ? customDates.map((date: Dayjs) => date.format("YYYY-MM-DD")) : [],
                            startDate: startDate ? startDate.format("YYYY-MM-DD") : "",
                            endDate: endDate ? endDate.format("YYYY-MM-DD") : "",
                            startTime: startTime ? startTime.format("HH:mm") : "",
                            endTime: endTime ? endTime.format("HH:mm") : "",
                        },
                    } as PlanNode;
                }
                if (item.type === "process" || item.type === "subProcess") {
                    return {
                        ...item,
                        children: updateChildren(item.children as (PlanNode | SubProcessNode)[]),
                    } as ProcessNode | SubProcessNode;
                }
                return item;
            }) as DataSourceNode[];
        };

        const updatedDataSource = updateChildren(dataSource);
        setDataSource(updatedDataSource);
    };

    const handleDataSourceChange = (updatedDataSource: DataSourceNode[]) => {
        setDataSource(updatedDataSource);
    };

    const handleSaveEmployees = (employees: any[], planId: number) => {
        const updateChildren = (items: DataSourceNode[]): DataSourceNode[] => {
            return items.map((item) => {
                if (item.type === "plan" && item.planId === planId) {
                    return { ...item, listEmployee: employees } as PlanNode;
                }
                if (item.type === "process" || item.type === "subProcess") {
                    return {
                        ...item,
                        children: updateChildren(item.children as (PlanNode | SubProcessNode)[]),
                    } as ProcessNode | SubProcessNode;
                }
                return item;
            }) as DataSourceNode[];
        };

        const updatedDataSource = updateChildren(dataSource);
        setDataSource(updatedDataSource);
    };

    const handleSubmit = async () => {
        try {
            if (dataSource.length === 0) {
                toast.error("No plans to submit. Please add at least one plan.");
                return;
            }

            const processId = selectedProcess?.processId;
            if (!processId) {
                toast.error("No process selected. Please select a process.");
                return;
            }

            if (planTargetType === 1 && growthStage.length === 0) {
                toast.error("Please select at least one Growth Stage Name for Land Plot/Land Row/Plant target.");
                return;
            }

            if (planTargetType === 1 && growthStage.length > 0) {
                const planTargetModels = form.getFieldValue("planTargetModel") || [];
                if (!Array.isArray(planTargetModels) || planTargetModels.length === 0) {
                    toast.error("Please add at least one target in the Plan Target section.");
                    return;
                }
            }

            const collectPlansWithHierarchy = (
                items: DataSourceNode[],
                processId: number,
                subProcessId: number | null = null
            ): { plan: PlanNode; processId: number; subProcessId: number | null }[] => {
                const plans: { plan: PlanNode; processId: number; subProcessId: number | null }[] = [];
                items.forEach((item) => {
                    if (item.type === "plan") {
                        plans.push({ plan: item, processId, subProcessId });
                    }
                    if (item.type === "process" || item.type === "subProcess") {
                        const nextSubProcessId = item.type === "subProcess" ? item.subProcessId : subProcessId;
                        plans.push(...collectPlansWithHierarchy(item.children, processId, nextSubProcessId));
                    }
                });
                return plans;
            };

            const allPlans = collectPlansWithHierarchy(dataSource, processId);
            if (allPlans.length === 0) {
                toast.error("No valid plans found to submit.");
                return;
            }

            const plansWithoutEmployees = allPlans.filter(
                ({ plan }) => !plan.listEmployee || plan.listEmployee.length === 0
            );
            if (plansWithoutEmployees.length > 0) {
                toast.error("Please assign at least one employee to each plan.");
                return;
            }

            const payload: PlanRequest[] = allPlans.map(({ plan, processId, subProcessId }) => {
                const startDate = new Date(plan.schedule.startDate);
                const endDate = new Date(plan.schedule.endDate);

                const adjustedStartDate = new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000).toISOString();
                const adjustedEndDate = new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000).toISOString();
                const planTargetModel: any[] = [];

                if (planTargetType === 1) {
                    const planTargetModels = form.getFieldValue("planTargetModel") || [];
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

                return {
                    startDate: adjustedStartDate,
                    endDate: adjustedEndDate,
                    isActive: true,
                    planName: plan.planName,
                    notes: plan.planNote,
                    planDetail: plan.planDetail,
                    frequency: plan.schedule.frequency || null,
                    assignorId: Number(getUserId()),
                    processId,
                    subProcessId,
                    cropId: undefined,
                    growthStageId: growthStage,
                    listLandPlotOfCrop: [],
                    masterTypeId: plan.masterTypeId,
                    dayOfWeek: plan.schedule.dayOfWeek || [],
                    dayOfMonth: plan.schedule.dayOfMonth || [],
                    customDates: plan.schedule.customDates || [],
                    listEmployee: plan.listEmployee,
                    startTime: `${plan.schedule.startTime}:00`,
                    endTime: `${plan.schedule.endTime}:00`,
                    planTargetModel,
                };
            });

            console.log("Payload to submit:", payload);

            const response = await planService.createManyPlans(payload, Number(getFarmId()));
            if (response.statusCode === 200) {
                toast.success(response.message);
                form.resetFields();
                planDetailsForm.resetFields();
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
            toast.error("Failed to create plans. Please try again later.");
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
                                        <InfoField
                                            label="Process Type"
                                            value={selectedProcess.processMasterTypeModel.masterTypeName}
                                            name="processType"
                                        />
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

                    <Flex vertical>
                        <div style={{ width: "70%", marginLeft: "23%" }}>
                            <InfoField
                                label="Growth Stage Name"
                                name={addPlanFormFields.growthStageID}
                                rules={RulesManager.getStageNameRules()}
                                placeholder="Enter the growth stage name"
                                onChange={(value) => {
                                    setGrowthStage(value);
                                }}
                                type="select"
                                options={growthStageOptions}
                                multiple
                                isEditing={isProcessSelected && planTargetType === 1}
                            />
                        </div>
                        {planTargetType === 2 && (
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
                        )}
                        {planTargetType === 3 && (
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
                        )}
                        {planTargetType === 1 && growthStage && isProcessSelected && (
                            <PlanTarget
                                plants={plantsOptions}
                                plantLots={[]}
                                graftedPlants={[]}
                                selectedGrowthStage={growthStage}
                                hasSelectedCrop={growthStage.length > 0 ? false : true}
                                onClearTargets={() => { }}
                            />
                        )}
                    </Flex>
                    <Divider className={style.divider} />

                    <Form form={planDetailsForm} component={false}>
                        <PlanDetailsTable
                            dataSource={dataSource}
                            onDataSourceChange={handleDataSourceChange}
                            onSaveEmployees={handleSaveEmployees}
                            onScheduleClick={handleScheduleClick}
                            onTaskAssignmentClick={handleTaskAssignmentClick}
                            workTypeOptions={workTypeOptions}
                            form={planDetailsForm}
                        />
                    </Form>
                    <Divider className={style.divider} />

                    <Modal
                        key={selectedPlanId}
                        title="Set Schedule"
                        open={isScheduleModalOpen}
                        onOk={() => setIsScheduleModalOpen(false)}
                        onCancel={() => {
                            setIsScheduleModalOpen(false);
                            setDateError(null);
                            scheduleForm.resetFields();
                        }}
                        footer={null}
                        width={800}
                    >
                        <Form
                            form={scheduleForm}
                            onFinish={(values) => {
                                const { dateRange, timeRange, frequency, dayOfWeek, dayOfMonth, customDates } = values;
                                if (!dateRange || !timeRange) {
                                    Modal.error({
                                        title: "Invalid Input",
                                        content: "Please select a valid date range and time range.",
                                        okText: "Close",
                                    });
                                    return;
                                }

                                if (frequency === "None" && (!customDates || customDates.length === 0)) {
                                    Modal.error({
                                        title: "Invalid Input",
                                        content: "Please select at least one specific date.",
                                        okText: "Close",
                                    });
                                    return;
                                }

                                if (frequency === "Weekly" && (!isDaySelectorSaved || !dayOfWeek || dayOfWeek.length === 0)) {
                                    Modal.error({
                                        title: "Invalid Input",
                                        content: "Please click Save in the DaySelector to confirm the selected days of the week.",
                                        okText: "Close",
                                    });
                                    return;
                                }

                                if (frequency === "Monthly" && (!isDaySelectorSaved || !dayOfMonth || dayOfMonth.length === 0)) {
                                    Modal.error({
                                        title: "Invalid Input",
                                        content: "Please click Save in the DaySelector to confirm the selected days of the month.",
                                        okText: "Close",
                                    });
                                    return;
                                }

                                handleSaveSchedule(values, selectedPlanId ?? 1);
                                setIsScheduleModalOpen(false);
                                setIsDaySelectorSaved(false);
                            }}
                            onFinishFailed={(errorInfo) => {
                                console.log("Form validation failed:", errorInfo);
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
                                        disabledDate={(current) => current && current.isBefore(dayjs().endOf("day"))}
                                    />
                                </Form.Item>
                            )}
                            <Form.Item>
                                <Button
                                    type="primary"
                                    disabled={(frequency === "Weekly" || frequency === "Monthly") && !isDaySelectorSaved}
                                    onClick={() => {
                                        scheduleForm.validateFields().then(() => scheduleForm.submit());
                                    }}
                                >
                                    Save
                                </Button>
                            </Form.Item>
                        </Form>
                    </Modal>

                    <TaskAssignmentModal
                        key={selectedPlanId}
                        visible={isTaskModalOpen}
                        onCancel={() => setIsTaskModalOpen(false)}
                        onSave={handleSaveEmployees}
                        employees={filteredEmployees}
                        selectedPlanId={selectedPlanId}
                        initialValues={initialValues}
                    />
                    <Flex justify="flex-end">
                        <CustomButton label="Add" handleOnClick={handleSubmit} disabled={!selectedProcess} />
                    </Flex>
                    <ToastContainer />
                </Form>
            </div>
        </div>
    );
};

export default AddPlanByProcess;