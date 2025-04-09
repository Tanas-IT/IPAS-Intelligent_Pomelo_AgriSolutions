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
import { useCropCurrentOption, useGrowthStageOptions, useLocalStorage, useMasterTypeOptions, useNotifications, useUnsavedChangesWarning } from "@/hooks";
import {
  fetchPlantLotsByUnitAndGrowthStage,
  fetchProcessesOfFarm,
  fetchUserInfoByRole,
  getFarmId,
  getGrowthStageOfProcess,
  getTypeOfProcess,
  getUserId,
  isDayInRange,
  planTargetOptions,
  RulesManager,
} from "@/utils";
import { addPlanFormFields, frequencyOptions, MASTER_TYPE } from "@/constants";
import {
  cropService,
  masterTypeService,
  planService,
  plantLotService,
  processService,
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
import { Rule } from "antd/es/form";

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
  const [targetType, setTargetType] = useState<string>();
  const [isTargetDisabled, setIsTargetDisabled] = useState<boolean>(true);
  const [isCropDisabled, setIsCropDisabled] = useState<boolean>(false);
  const [masterTypeGrafting, setMasterTypeGrafting] = useState<number[]>([]);
  const [masterTypePlantLot, setMasterTypePlantLot] = useState<number[]>([]);

  const { options: growthStageOptions } = useGrowthStageOptions(false);
  const { options: landPlots } = useLandPlotOptions();
  const { options: landRowOptions } = useLandRowOptions(selectedLandPlot);
  const { options: plantsOptions } = usePlantOfRowOptions(selectedLandRow);
  // const { options: plantLotOptions } = usePlantLotOptions();
  const { options: graftedPlantsOptions } = useGraftedPlantOptions(farmId);
  const { options: cropOptions } = useCropCurrentOption();
  const { options: processTypeOptions } = useMasterTypeOptions(MASTER_TYPE.WORK, false);

  const [selectedCrop, setSelectedCrop] = useState<number | null>(null);
  const [landPlotOfCropOptions, setLandPlotOfCropOptions] = useState<SelectOption[]>([]);
  // const [processTypeOptions, setProcessTypeOptions] = useState<SelectOption[]>([]);
  const [plantLotOptions, setPlantLotOptions] = useState<SelectOption[]>([]);

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

  // useEffect(() => {
  //   form.setFieldValue("masterTypeId", undefined);
  //   if (selectedGrowthStage && selectedGrowthStage.length > 0) {
  //     planService.filterTypeWorkByGrowthStage(selectedGrowthStage).then((data) => {
  //       setProcessTypeOptions(
  //         data.map((item) => ({
  //           value: item.masterTypeId,
  //           label: item.masterTypeName,
  //         }))
  //       );
  //     });
  //   } else {
  //     setProcessTypeOptions([]);
  //   }
  // }, [selectedGrowthStage]);

  useEffect(() => {
    const updateProcessFarmOptions = async () => {
      if (targetType === "graftedPlant") {
        const result = await masterTypeService.getProcessTypeSelect("Grafting");

        if (result.statusCode === 200) {
          console.log("thanh cong");
          setMasterTypeGrafting(result.data.map((m) => m.id));
          setProcessFarmOptions(await processService.getProcessOfFarmByMasterType(result.data.map((m) => m.id)));
        } else {
          setProcessFarmOptions(await processService.getProcessOfFarmByMasterType([]));
        }
      } else if (targetType === "plantLot") {
        const result = await masterTypeService.getProcessTypeSelect("PlantLot");

        if (result.statusCode === 200) {
          setMasterTypePlantLot(result.data.map((m) => m.id));
          setProcessFarmOptions(await processService.getProcessOfFarmByMasterType(result.data.map((m) => m.id)));
        } else {
          setProcessFarmOptions(await processService.getProcessOfFarmByMasterType([]));
        }
      } else {
        setProcessFarmOptions(await fetchProcessesOfFarm(farmId, true));
      }
    };

    updateProcessFarmOptions();
  }, [targetType]);

  const handlePlanTargetChange = async (target: string) => {
    setTargetType(target);
    form.setFieldsValue({
      planTargetModel: [],
    });

    if (target === "graftedPlant") {
      setProcessFarmOptions(await processService.getProcessOfFarmByMasterType(masterTypeGrafting));
      form.setFieldValue("growthStageId", undefined);
      form.setFieldValue("processId", undefined);
      setIsLockedGrowthStage(false);
      setIsTargetDisabled(true);
      setSelectedGrowthStage([]);
    } else if (target === "plantLot") {
      form.setFieldValue("cropId", undefined);
      setIsCropDisabled(true);
      setProcessFarmOptions(await fetchProcessesOfFarm(farmId, true));
      setIsTargetDisabled(true);
      form.setFieldValue("processId", undefined);
      // setIsLockedGrowthStage(false);
    } else {
      // form.setFieldValue("processId", undefined);
      // setIsLockedGrowthStage(false);
      setIsCropDisabled(false);
      setProcessFarmOptions(await fetchProcessesOfFarm(farmId, true));
      setIsTargetDisabled(false);
    }
  };

  const handleChangeProcess = async (processId: number | undefined) => {
    if (processId) {
      const growthStageId = await getGrowthStageOfProcess(processId);
      console.log("growthStageId", growthStageId);

      form.setFieldValue("processId", processId);
      const masterTypeId = await getTypeOfProcess(processId);
      form.setFieldValue("masterTypeId", Number(masterTypeId));
      setIsLockedGrowthStage(true);
      // neu process co target la grafting
      if ((await masterTypeService.IsMasterTypeHasTarget(masterTypeId, "Grafting")).data) {
        setTargetType("graftedPlant");
        form.setFieldValue("planTarget", "graftedPlant");
        form.setFieldValue("growthStageId", undefined);
        // setProcessTypeOptions((await masterTypeService.getProcessTypeSelect("Grafting")).data.map((pt) => ({
        //   value: pt.id,
        //   label: pt.name
        // })))
        setIsLockedGrowthStage(true);
      } else if ((await masterTypeService.IsMasterTypeHasTarget(masterTypeId, "PlantLot")).data) {
        setTargetType("plantLot");
        form.setFieldValue("planTarget", "plantLot");
        form.setFieldValue("growthStageId", undefined);

        // setProcessTypeOptions((await masterTypeService.getProcessTypeSelect("PlantLot")).data.map((pt) => ({
        //   value: pt.id,
        //   label: pt.name
        // })))
        setIsLockedGrowthStage(true);
      } else {
        form.setFieldValue("growthStageId", [growthStageId]);
        if (growthStageId) {

          setSelectedGrowthStage([growthStageId]);
        }
        form.setFieldsValue({ planTargetModel: [] });
      }
    } else {
      form.setFieldValue("processId", undefined);
      form.setFieldValue("growthStageId", undefined);
      form.setFieldValue("masterTypeId", undefined);
      setIsLockedGrowthStage(false);
      // setProcessTypeOptions([]);
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



  const handleSubmit = async (values: any) => {
    const { dateRange, timeRange, planTargetModel, frequency, graftedPlant, plantLot } = values;
    const startDate = new Date(dateRange?.[0]);
    const endDate = new Date(dateRange?.[1]);

    const adjustedStartDate = new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000);
    const adjustedEndDate = new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000);

    const startTime = timeRange?.[0]?.toDate().toLocaleTimeString();
    const endTime = timeRange?.[1]?.toDate().toLocaleTimeString();
    if (frequency === "Weekly" && dayOfWeek.length === 0) {
      toast.error("Please select at least one custom date for Weekly frequency.");
      return;
    }

    if (frequency === "Monthly" && dayOfMonth.length === 0) {
      toast.error("Please select at least one day for Monthly frequency.");
      return;
    }

    if (assignorId === undefined) {
      toast.error("Please select at least one employee.");
      return;
    }

    if (!selectedCrop && planTargetModel.length === 0 && targetType === "regular") {
      toast.error("Please select at least one plan target.");
      return;
    }
    const graftedPlantIDs = graftedPlant || [];
    const plantLotIDs = plantLot || [];

    let formattedPlanTargetModel;
    // Format planTargetModel
    if (targetType === "regular") {
      formattedPlanTargetModel = planTargetModel.map((target: any) => {
        return {
          landPlotID: target.landPlotID ?? 0,
          landRowID: target.landRowID ? (Array.isArray(target.landRowID) ? target.landRowID : [target.landRowID]) : [],
          plantID: target.plantID ?? [],
          graftedPlantID: [],
          plantLotID: [],
          unit: target.unit,
        };
      });
    } else if (targetType === "plantLot") {
      console.log("vô plantLot");
      formattedPlanTargetModel = [{
        landPlotID: undefined,
        landRowID: [],
        plantID: [],
        graftedPlantID: [],
        plantLotID: plantLotIDs,
        unit: targetType,
      }];
    } else if (targetType === "graftedPlant") {
      console.log("vô grafted");

      formattedPlanTargetModel = [{
        landPlotID: undefined,
        landRowID: [],
        plantID: [],
        graftedPlantID: graftedPlantIDs,
        plantLotID: [],
        unit: targetType,
      }];
    }

    console.log("formattedPlanTargetModel", formattedPlanTargetModel);

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
      planTargetModel: formattedPlanTargetModel,
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

  const fetchData = async () => {
    setProcessFarmOptions(await fetchProcessesOfFarm(farmId, true));
    setEmployee(await fetchUserInfoByRole("User"));
    // setPlantLotOptions((await usePlantLotOptions()).options);
    const plantLots = await plantLotService.getPlantLotSelected();
    setPlantLotOptions(plantLots)
  };

  useEffect(() => {
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
                  onClick={async () => {
                    const masterTypeId = await getTypeOfProcess(form.getFieldValue("processId"));
                    if (masterTypeId === 14) {
                      form.setFieldValue("planTarget", undefined);
                      form.setFieldValue("graftedPlant", undefined);
                      setTargetType(undefined);
                    }
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
                // rules={[
                //   {
                //     // Chỉ validate khi submit form
                //     validateTrigger: 'onSubmit',
                //     validator: (_: any, value: any) => {
                //       const processId = form.getFieldValue(addPlanFormFields.processId);
                //       // k chọn process && k chọn growth stage
                //       if (!processId && (!value || value.length === 0)) {
                //         return Promise.reject(new Error("Growth Stage is required when no Process is selected!"));
                //       }
                //       return Promise.resolve();
                //     },
                //   },
                // ]}
                options={growthStageOptions}
                isEditing={!isLockedGrowthStage}
                onChange={(value) => {
                  setSelectedGrowthStage(value);
                  if (targetType === "regular") {
                    form.setFieldsValue({ planTargetModel: [] });
                  }
                }}
                type="select"
                multiple
                hasFeedback={false}
              />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <InfoField
                label="Select Plan Target"
                name={addPlanFormFields.planTarget}
                options={planTargetOptions}
                rules={RulesManager.getPlanTargetRules()}
                isEditing={true}
                type="select"
                hasFeedback={false}
                onChange={(value) => handlePlanTargetChange(value)}
              />
            </Col>
            {targetType === "plantLot" && (
              <Col span={12}>
                <InfoField
                  label="Select Plant Lot"
                  name={addPlanFormFields.plantLot}
                  options={plantLotOptions}
                  multiple
                  // rules={RulesManager.getPlantLotRules()}
                  isEditing={true}
                  type="select"
                  hasFeedback={false}
                />
              </Col>
            )}

            {targetType === "graftedPlant" && (
              <Col span={12}>
                <InfoField
                  label="Select Grafted Plant"
                  name={addPlanFormFields.graftedPlant}
                  options={graftedPlantsOptions}
                  // rules={RulesManager.getGraftedPlantRules()}
                  isEditing={true}
                  type="select"
                  multiple
                  hasFeedback={false}
                />
              </Col>
            )}
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Flex vertical>
                <InfoField
                  label="Crop Name"
                  name={addPlanFormFields.cropId}
                  // rules={RulesManager.getCropRules()}
                  options={cropOptions}
                  isEditing={!isCropDisabled}
                  type="select"
                  hasFeedback={false}
                  onChange={(value) => {
                    setSelectedCrop(value);
                    if (targetType === "regular") {
                      form.setFieldValue("planTarget", "regular");
                    }

                    setIsTargetDisabled(true);
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
                    setIsTargetDisabled(false);
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

        <Divider className={style.divider} />
        <PlanTarget
          // landPlotOptions={landPlots}
          // landRows={landRowOptions}
          plants={plantsOptions}
          plantLots={plantLotOptions}
          graftedPlants={graftedPlantsOptions}
          selectedGrowthStage={selectedGrowthStage}
          hasSelectedCrop={isTargetDisabled}
          onClearTargets={() => form.setFieldsValue({ planTargetModel: [] })}
        />

        <Divider className={style.divider} />

        

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
