import { Badge, Button, Divider, Flex, Image, Modal, Tag } from "antd";
import style from "./WorklogDetail.module.scss";
import { Icons, Images } from "@/assets";
import { useNavigate, useParams } from "react-router-dom";
import { PATHS } from "@/routes";
import { toast, ToastContainer } from "react-toastify";
import TimelineNotes from "./TimelineNotes/TimelineNotes";
import { useModal } from "@/hooks";
import { CreateFeedbackRequest, GetFeedback } from "@/payloads/feedback";
import { useEffect, useState } from "react";
import FeedbackModal from "./FeedbackModal/FeedbackModal";
import { cropService, feedbackService, harvestService, worklogService } from "@/services";
import {
  CancelReplacementRequest,
  GetWorklogDetail,
  ListEmployeeUpdate,
  TaskFeedback,
  UpdateStatusWorklogRequest,
  UpdateWorklogReq,
} from "@/payloads/worklog";
import { formatDate, formatDateW, getUserId } from "@/utils";
import { GetCropDetail, PlanTarget, PlanTargetModel } from "@/payloads";
import { ConfirmModal, CustomButton, Loading, Tooltip, UserAvatar } from "@/components";
import PlanTargetTable from "@/pages/Plan/PlanDetails/PlanTargetTable";
import AttendanceModal from "./AttendanceModal";
import EditWorklogModal from "./EditWorklogModal";
import RedoWorklogModal from "./RedoWorklogModal";
import { statusIconMap } from "@/constants/statusMap";
import DependencyModal from "./DependencyModal";
import { useCropStore } from "@/stores";
import { planStatusColors, ROUTES } from "@/constants";

const InfoField = ({
  icon: Icon,
  label,
  value,
  planId,
  processId,
  isTag = false,
  isHarvest = false,
  handleViewDetail,
}: {
  icon: React.ElementType;
  label: string;
  value: string | React.ReactNode;
  planId?: number;
  processId?: number;
  isTag?: boolean;
  isHarvest?: boolean;
  handleViewDetail: (value: number) => void;
}) => {
  const navigate = useNavigate();

  const getNavigationPath = () => {
    if (label === "Plan Name") return `/plans/${planId}`;
    if (label === "Process Name") return `/processes/${processId}`;
    return null;
  };

  const path = getNavigationPath();
  const isClickable = path !== null && value !== "None";

  return (
    <Flex className={style.infoField}>
      <Flex className={style.fieldLabelWrapper}>
        <Icon className={style.fieldIcon} />
        <label className={style.fieldLabel}>{label}:</label>
      </Flex>
      <label className={style.fieldValue}>
        {isClickable ? (
          <span className={style.linkText} onClick={() => navigate(path!)}>
            {value}
          </span>
        ) : label === "Harvest" && isHarvest ? (
          <Button type="dashed" onClick={() => handleViewDetail(Number(value))}>
            View Harvest Detail
          </Button>
        ) : isTag ? (
          <Tag color="green">{value}</Tag>
        ) : (
          value
        )}
      </label>
    </Flex>
  );
};

function WorklogDetail() {
  const navigate = useNavigate();
  const formModal = useModal<GetFeedback>();
  const [warning, setWarning] = useState<{ message: string; names: string[] } | null>(null);
  const [feedbackList, setFeedbackList] = useState<TaskFeedback[]>([]);
  const { id } = useParams();
  const [worklogDetail, setWorklogDetail] = useState<GetWorklogDetail | undefined>();
  const [selectedFeedback, setSelectedFeedback] = useState<TaskFeedback>();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedFeedbackToDelete, setSelectedFeedbackToDelete] = useState<TaskFeedback | null>(
    null,
  );
  const [isAttendanceModalVisible, setIsAttendanceModalVisible] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<{ [key: number]: string | null }>({});
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRedoModalOpen, setIsRedoModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<[string, string]>(["", ""]);
  const [initialReporterId, setInitialReporterId] = useState<number | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const { setIsHarvestDetailView, setSelectedHarvest, setCrop } = useCropStore();
  const rawStatus = worklogDetail?.status || "Not Started";
  const normalizedStatus = rawStatus.toLowerCase();
  const classKey = normalizedStatus.replace(/\s+/g, "");
  const statusClass = style[classKey] || style.default;
  const icon = statusIconMap["normalizedStatus"];

  const handleViewDetail = async (id: number) => {
    const res = await harvestService.getHarvest(id);
    setSelectedHarvest(res.data);
    setIsHarvestDetailView(true); // Đánh dấu đang xem chi tiết

    const cropId = worklogDetail?.cropId;
    if (cropId) {
      // 👉 Gọi API để lấy crop detail trước khi navigate
      const cropRes = await cropService.getCropOfFarm(cropId);
      setCrop(cropRes.data); // Gán crop vào store

      navigate(ROUTES.CROP_DETAIL(cropId), {
        state: { isFromWorklog: true },
      });
    }
  };

  const handleUpdateFeedback = (feedback: TaskFeedback) => {
    setSelectedFeedback(feedback);
    formModal.showModal();
  };

  const handleCloseModal = () => {
    setSelectedFeedback(undefined);
    formModal.hideModal();
  };

  const handleOpenDeleteModal = (feedback: TaskFeedback) => {
    setSelectedFeedbackToDelete(feedback);
    setIsDeleteModalVisible(true);
  };

  const handleReplaceEmployee = (replaceUserId: number, replacementUserId: number) => {
    if (!worklogDetail) return;

    const updatedEmployees = worklogDetail.listEmployee.map((employee) =>
      employee.userId === replaceUserId
        ? { ...employee, statusOfUserWorkLog: "BeReplaced" }
        : employee,
    );

    const updatedReporter = worklogDetail.reporter.map((rep) =>
      rep.userId === replaceUserId ? { ...rep, statusOfUserWorkLog: "BeReplaced" } : rep,
    );

    const updatedReplacementEmployees = [
      ...(worklogDetail.replacementEmployee || []).filter(
        (rep) => rep.replaceUserId !== replaceUserId,
      ),
      { replaceUserId, userId: replacementUserId },
    ];

    setWorklogDetail({
      ...worklogDetail,
      listEmployee: updatedEmployees,
      reporter: updatedReporter,
      replacementEmployee: updatedReplacementEmployees,
    });
  };

  const handleRemoveReplacement = async (replaceUserId: number) => {
    if (!worklogDetail) return;

    const updatedReplacementEmployees = worklogDetail.replacementEmployee?.filter(
      (rep) => rep.replaceUserId !== replaceUserId,
    );
    const updatedEmployees = worklogDetail.listEmployee.map((employee) =>
      employee.userId === replaceUserId
        ? { ...employee, statusOfUserWorkLog: "Received" }
        : employee,
    );
    const updatedReporter = worklogDetail.reporter.map((rep) =>
      rep.userId === replaceUserId ? { ...rep, statusOfUserWorkLog: "Received" } : rep,
    );

    setWorklogDetail({
      ...worklogDetail,
      listEmployee: updatedEmployees,
      reporter: updatedReporter,
      replacementEmployee: updatedReplacementEmployees,
    });

    const payload: CancelReplacementRequest = {
      worklogId: Number(id),
      userId: replaceUserId,
    };
    try {
      await worklogService.cancelReplacement(payload);
      toast.success("Removed successfully!");
      await fetchPlanDetail();
    } catch (error) {
      toast.warning("Failed to remove replacement.");
    }
  };

  const handleSaveEdit = async (
    tempReporterId?: number,
    replacingStates?: { [key: number]: number | null },
  ) => {
    if (!worklogDetail || !id) return;

    try {
      const listEmployeeUpdate: ListEmployeeUpdate[] = [];

      // Handle reporter replacement
      if (replacingStates) {
        Object.entries(replacingStates).forEach(([replaceUserId, replacementUserId]) => {
          if (replacementUserId !== null) {
            const replaceUserIdNum = Number(replaceUserId);
            let isReporterReplacement = false;
            if (worklogDetail?.replacementEmployee?.length > 0) {
              const replacementReporter = worklogDetail.replacementEmployee.find(
                (emp) => emp.replaceUserIsRepoter && emp.replaceUserId === replaceUserIdNum,
              );
              if (replacementReporter) {
                isReporterReplacement = true;
                // console.log("[DEBUG] Found reporter in replacementEmployee:", replacementReporter);
              }
            }

            if (!isReporterReplacement && worklogDetail?.reporter?.length > 0) {
              isReporterReplacement = worklogDetail.reporter.some(
                (rep) => rep.isReporter && rep.userId === replaceUserIdNum,
              );
              if (isReporterReplacement) {
                // console.log("[DEBUG] Found reporter in reporter:", replaceUserIdNum);
              }
            }

            if (isReporterReplacement) {
              listEmployeeUpdate.push({
                oldUserId: replaceUserIdNum,
                newUserId: replacementUserId,
                isReporter: true,
                status: "update",
              });

              if (tempReporterId === replaceUserIdNum) {
                tempReporterId = replacementUserId;
              }
            } else {
              const targetUser = [...worklogDetail.listEmployee, ...worklogDetail.reporter].find(
                (user) => user.userId === replaceUserIdNum,
              );

              if (targetUser) {
                listEmployeeUpdate.push({
                  oldUserId: replaceUserIdNum,
                  newUserId: replacementUserId,
                  isReporter: false,
                  status: targetUser.statusOfUserWorkLog === "Rejected" ? "add" : "update",
                });
              }
            }
          }
        });
      }

      if (tempReporterId && tempReporterId !== initialReporterId) {
        const existingUpdate = listEmployeeUpdate.find(
          (item) => item.isReporter && item.oldUserId === initialReporterId,
        );

        if (!existingUpdate) {
          listEmployeeUpdate.push({
            oldUserId: initialReporterId!,
            newUserId: tempReporterId,
            isReporter: true,
            status: "update",
          });
        }
      }
      const payload: UpdateWorklogReq = {
        workLogId: Number(id),
      };

      if (listEmployeeUpdate.length > 0) {
        payload.listEmployeeUpdate = listEmployeeUpdate;
      }

      if (selectedDate && selectedDate !== worklogDetail.date) {
        payload.dateWork = selectedDate;
      }
      if (selectedTimeRange[0] && selectedTimeRange[0] !== worklogDetail.actualStartTime) {
        payload.startTime = selectedTimeRange[0];
      }
      if (selectedTimeRange[1] && selectedTimeRange[1] !== worklogDetail.actualEndTime) {
        payload.endTime = selectedTimeRange[1];
      }
      if (
        !payload.listEmployeeUpdate &&
        !payload.dateWork &&
        !payload.startTime &&
        !payload.endTime
      ) {
        toast.info("No changes to save.");
        setIsEditModalVisible(false);
        return;
      }

      const response = await worklogService.updateWorklog(payload);

      if (response?.statusCode === 200) {
        let updatedEmployees = worklogDetail.listEmployee;
        let updatedReporter = worklogDetail.reporter;
        let updatedReplacementEmployees = worklogDetail.replacementEmployee || [];

        if (
          tempReporterId &&
          tempReporterId !== initialReporterId &&
          typeof tempReporterId === "number"
        ) {
          updatedEmployees = worklogDetail.listEmployee.map((employee) => ({
            ...employee,
            isReporter: employee.userId === tempReporterId,
          }));
          updatedReporter = updatedEmployees.filter((emp) => emp.isReporter);
          setInitialReporterId(tempReporterId);
        }

        if (replacingStates) {
          updatedEmployees = worklogDetail.listEmployee.map((employee) => {
            const replacementUserId = replacingStates[employee.userId];
            if (replacementUserId !== undefined && replacementUserId !== null) {
              return { ...employee, statusOfUserWorkLog: "BeReplaced" };
            }
            return employee;
          });
          updatedReporter = updatedReporter.map((rep) => {
            const replacementUserId = replacingStates[rep.userId];
            if (replacementUserId !== undefined && replacementUserId !== null) {
              return { ...rep, statusOfUserWorkLog: "BeReplaced" };
            }
            return rep;
          });
          updatedReplacementEmployees = Object.entries(replacingStates)
            .filter(([_, userId]) => userId !== null)
            .map(([replaceUserId, userId]) => ({
              replaceUserId: Number(replaceUserId),
              userId: userId as number,
            }));
        }

        setWorklogDetail({
          ...worklogDetail,
          listEmployee: updatedEmployees,
          reporter: updatedReporter.length > 0 ? [updatedReporter[0]] : [],
          replacementEmployee: updatedReplacementEmployees,
          date: payload.dateWork || worklogDetail.date,
          actualStartTime: payload.startTime || worklogDetail.actualStartTime,
          actualEndTime: payload.endTime || worklogDetail.actualEndTime,
        });

        toast.success("Worklog updated successfully!");
        await fetchPlanDetail();
        setIsEditModalVisible(false);
      } else {
        toast.warning(response?.message || "Failed to update worklog.");
      }
    } catch (error) {
      console.error("Error updating worklog:", error);
      toast.warning("An error occurred while updating the worklog.");
    }
  };

  const handleDeleteFeedback = async () => {
    if (!selectedFeedbackToDelete) return;

    try {
      await feedbackService.deleteFeedback(selectedFeedbackToDelete.taskFeedbackId);
      setFeedbackList(
        feedbackList.filter((fb) => fb.taskFeedbackId !== selectedFeedbackToDelete.taskFeedbackId),
      );
      setIsDeleteModalVisible(false);
    } catch (error) {
      console.error("Error deleting feedback:", error);
    }
  };

  const [infoFieldsLeft, setInfoFieldsLeft] = useState([
    { label: "Crop", value: "N/A", icon: Icons.growth },
    { label: "Plan Name", value: "N/A", icon: Icons.box },
    { label: "Growth Stage", value: "N/A", icon: Icons.plant },
  ]);

  const [infoFieldsRight, setInfoFieldsRight] = useState([
    { label: "Process Name", value: "N/A", icon: Icons.process },
    { label: "Type", value: "N/A", icon: Icons.category, isTag: true },
    { label: "Harvest", value: "N/A", icon: Icons.plant, isTag: false, isHarvest: false },
  ]);

  const addModal = useModal<CreateFeedbackRequest>();

  const handleFeedback = () => {
    formModal.showModal();
  };

  const handleAdd = () => {};

  const determineUnit = (planTargetModels: PlanTargetModel) => {
    const { rows, plants, landPlotName, graftedPlants, plantLots } = planTargetModels;

    if (rows && rows.length > 0) {
      return "Row";
    }
    if (plants && plants.length > 0) {
      return "Plant";
    }
    if (graftedPlants && graftedPlants.length > 0) {
      return "Grafted Plant";
    }
    if (plantLots && plantLots.length > 0) {
      return "Plant Lot";
    }
    if (landPlotName) {
      return "Plot";
    }
    return "Unknown";
  };

  const transformPlanTargetData = (planTargetModels: PlanTargetModel[]): PlanTarget[] => {
    return planTargetModels.flatMap((model) => {
      const { rows, landPlotName, graftedPlants, plantLots, plants } = model;
      const unit = determineUnit(model);
      const data: PlanTarget[] = [];

      switch (unit) {
        case "Row":
          if (rows && rows.length > 0) {
            const rowNames = rows.map((row) => `Row ${row.rowIndex}`);
            const plantNames = rows.flatMap((row) => row.plants.map((plant) => plant.plantName));
            data.push({
              type: "Row",
              plotNames: landPlotName ? [landPlotName] : undefined,
              rowNames: rowNames.length > 0 ? rowNames : undefined,
              plantNames: plantNames.length > 0 ? plantNames : undefined,
            });
          }
          break;

        case "Plant":
          if (plants && plants.length > 0) {
            data.push({
              type: "Plant",
              plotNames: landPlotName ? [landPlotName] : undefined,
              plantNames: plants.map((plant) => plant.plantName),
            });
          }
          break;

        case "Grafted Plant":
          if (graftedPlants && graftedPlants.length > 0) {
            data.push({
              type: "Grafted Plant",
              plotNames: landPlotName ? [landPlotName] : undefined,
              graftedPlantNames: graftedPlants.map((plant) => plant.name),
            });
          }
          break;

        case "Plant Lot":
          if (plantLots && plantLots.length > 0) {
            data.push({
              type: "Plant Lot",
              plotNames: landPlotName ? [landPlotName] : undefined,
              plantLotNames: plantLots.map((lot) => lot.name),
            });
          }
          break;

        case "Plot":
          if (landPlotName) {
            data.push({
              type: "Plot",
              plotNames: [landPlotName],
            });
          }
          break;

        default:
          break;
      }

      return data;
    });
  };

  const checkAndNotifyReassignment = async (workLog: GetWorklogDetail) => {
    const rejectedEmployees = [
      ...workLog.listEmployee.filter((emp) => emp.statusOfUserWorkLog === "Rejected"),
      ...workLog.reporter.filter((rep) => rep.statusOfUserWorkLog === "Rejected"),
    ];

    const replacedUserIds = workLog.replacementEmployee.map((replacement) => replacement.userId);

    const employeesNeedingReassignment = rejectedEmployees.filter(
      (emp) => !replacedUserIds.includes(emp.userId),
    );

    if (
      employeesNeedingReassignment.length > 0 &&
      (worklogDetail?.status === "Not Started" || worklogDetail?.status === "In Progress")
    ) {
      const namesNeedingReassignment = employeesNeedingReassignment.map((emp) => emp.fullName);
      const message = "Need to re-assign because there are rejected employees:";
      setWarning({ message, names: namesNeedingReassignment });
      return message;
    } else {
      setWarning(null);
      return null;
    }
  };

  const fetchPlanDetail = async () => {
    try {
      // setIsLoading(true);
      const res = await worklogService.getWorklogDetail(Number(id));
      setWorklogDetail(res);
      checkAndNotifyReassignment(res);

      const initialAttendanceStatus = {
        ...res?.listEmployee.reduce((acc, employee) => {
          acc[employee.userId] = employee.statusOfUserWorkLog;
          return acc;
        }, {} as { [key: number]: string | null }),
        ...res?.reporter.reduce((acc, reporter) => {
          acc[reporter.userId] = reporter.statusOfUserWorkLog;
          return acc;
        }, {} as { [key: number]: string | null }),
      };
      setAttendanceStatus(initialAttendanceStatus);
      setFeedbackList(res.listTaskFeedback || []);
      setSelectedTimeRange([res.actualStartTime || "", res.actualEndTime || ""]);
      setSelectedDate(res.date || "");

      let initialReporterId: number | undefined;
      if (res.replacementEmployee?.length > 0) {
        const replacementReporter = res.replacementEmployee.find((emp) => emp.replaceUserIsRepoter);
        if (replacementReporter) {
          initialReporterId = replacementReporter.replaceUserId;
        }
      }
      if (!initialReporterId && res.reporter?.length > 0) {
        initialReporterId = res.reporter.find((emp) => emp.isReporter)?.userId;
      }

      setInitialReporterId(initialReporterId);

      setInfoFieldsLeft([
        { label: "Crop", value: res.cropName || "None", icon: Icons.growth },
        { label: "Plan Name", value: res.planName || "None", icon: Icons.box },
        {
          label: "Growth Stage",
          value: res.listGrowthStageName.join(", ") || "None",
          icon: Icons.plant,
        },
      ]);

      setInfoFieldsRight([
        { label: "Process Name", value: res.processName || "None", icon: Icons.process },
        {
          label: "Type",
          value: res.masterTypeName || "Harvest",
          icon: Icons.category,
          isTag: true,
        },
        {
          label: "Harvest",
          value: res.isHarvest ? "Yes" : "No",
          icon: Icons.category,
          isHarvest: res.isHarvest,
          isTag: false,
        },
      ]);

      infoFieldsRight[0].value = res.workLogName || "Caring Process for Pomelo Tree";
      infoFieldsRight[1].value = res.status || "Watering";
    } catch (error) {
      console.error("error", error);
      navigate("/error");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (!id) {
      navigate("/404");
      return;
    }

    fetchPlanDetail();
  }, [id]);

  const handleTakeAttendance = () => {
    setIsAttendanceModalVisible(true);
  };

  const handleSaveAttendance = async () => {
    const allUsers = [...(worklogDetail?.listEmployee || []), ...(worklogDetail?.reporter || [])];

    const listEmployee = allUsers.map((user) => ({
      userId: user.userId,
      status: attendanceStatus[user.userId] || "Rejected",
    }));

    try {
      const canCheck = await worklogService.canTakeAttendance(Number(id));
      if (canCheck.statusCode !== 200 || !canCheck.data) {
        toast.warning(canCheck.message);
        return;
      }

      const resultAttendance = await worklogService.saveAttendance(Number(id), listEmployee);
      if (resultAttendance && resultAttendance.statusCode === 200) {
        toast.success(resultAttendance.message);
        await fetchPlanDetail();
      } else {
        toast.warning(resultAttendance.message);
      }
      setIsAttendanceModalVisible(false);
    } catch (error) {
      console.error("Error saving attendance:", error);
    }
  };

  const handleAttendanceChange = (userId: number, status: "Received" | "Rejected" | null) => {
    setAttendanceStatus((prev) => ({
      ...prev,
      [userId]: status,
    }));
  };

  const handleCloseEditModal = () => {
    setIsEditModalVisible(false);
    if (worklogDetail) {
      setSelectedTimeRange([
        worklogDetail.actualStartTime || "",
        worklogDetail.actualEndTime || "",
      ]);
      setSelectedDate(worklogDetail.date || "");
    }
    fetchPlanDetail();
  };

  const handleCloseAttendanceModal = async () => {
    setIsAttendanceModalVisible(false);
    fetchPlanDetail();
  };

  const handleConfirm = async () => {
    // Logic khi xác nhận
    const payload: UpdateStatusWorklogRequest = {
      workLogId: Number(id),
      status: "Reviewing",
    };
    const res = await worklogService.updateStatusWorklog(payload);
    if (res.statusCode === 200) {
      toast.success("Worklog marked as completed successfully");
      fetchPlanDetail();
    } else {
      toast.warning("Failed to mark worklog as completed");
    }
    setIsConfirmModalOpen(false);
  };

  if (isLoading)
    return (
      <Flex justify="center" align="center" style={{ width: "100%" }}>
        <Loading />
      </Flex>
    );

  return (
    <div className={style.container}>
      <Flex className={style.extraContent}>
        <Tooltip title="Back to calendar">
          <Icons.back
            className={style.backIcon}
            onClick={() => navigate(PATHS.HR.WORKLOG_CALENDAR)}
          />
        </Tooltip>
      </Flex>
      <Divider className={style.divider} />
      <Flex className={style.contentSectionTitleLeft}>
        <p className={style.title}>{worklogDetail?.workLogName || "Caring Process"}</p>
        <Tooltip title="Work-log">
          <Icons.tag className={style.iconTag} />
        </Tooltip>
        {/* <Tag className={`${style.statusTag} ${statusClass}`}>
          <span style={{ marginRight: 6 }}>{icon}</span>
          {rawStatus}
        </Tag> */}
        <Tag color={planStatusColors[rawStatus] || "default"} className={style.statusTag}>
          <span style={{ marginRight: 6 }}>{icon}</span>
          {rawStatus}
        </Tag>
        <Flex gap={15}>
          <Button
            ghost
            style={{
              fontWeight: 500,
              borderWidth: 2,
              color: "#20461e",
              backgroundColor: "#bcd379",
            }}
            onClick={handleTakeAttendance}
          >
            Take Attendance
          </Button>
        </Flex>
      </Flex>
      <label className={style.subTitle}>Code: {worklogDetail?.workLogCode || "laggg"}</label>

      <Flex vertical gap={10} className={style.contentSectionUser}>
        <Flex vertical>
          <Flex align="center" gap={8}>
            <UserAvatar avatarURL={worklogDetail?.reporter[0]?.avatarURL || undefined} size={35} />
            <label className={style.createdBy}>{worklogDetail?.assignorName || "laggg"}</label>
            <label className={style.textCreated}>created this plan</label>
            <label className={style.createdDate}>{formatDateW(worklogDetail?.date ?? "2")}</label>
            <Button
              onClick={() => setIsModalOpen(true)}
              style={{
                fontWeight: 500,
                borderWidth: 2,
                borderColor: "#20461e",
                color: "#20461e",
              }}
            >
              View Dependency Worklogs
            </Button>

            <Button
              type="primary"
              danger
              onClick={() => setIsConfirmModalOpen(true)}
              style={{
                fontWeight: 500,
              }}
              disabled={
                !worklogDetail?.status ||
                !["Not Started", "In Progress"].includes(worklogDetail.status)
              }
            >
              Mark as complete
            </Button>
          </Flex>
          <Flex vertical gap={10} className={style.info}>
            <Flex gap={15}>
              <label className={style.textUpdated}>Assigned To:</label>
              {worklogDetail?.listEmployee?.map((employee, index) => {
                const isRejected = employee.statusOfUserWorkLog === "Rejected";
                const isBeReplaced = employee.statusOfUserWorkLog === "BeReplaced";
                const borderColor = isRejected ? "red" : isBeReplaced ? "goldenrod" : "none";
                const textColor = isRejected ? "red" : isBeReplaced ? "goldenrod" : "#bcd379";
                const tooltipText = isRejected
                  ? "Rejected"
                  : isBeReplaced
                  ? "Being Replaced"
                  : "Received";

                return (
                  <Tooltip key={index} title={tooltipText}>
                    <Flex align="center" gap={8}>
                      <UserAvatar avatarURL={employee.avatarURL || undefined} size={30} />
                      <label className={style.createdBy} style={{ color: textColor }}>
                        {employee.fullName || "Unknown"}
                      </label>
                    </Flex>
                  </Tooltip>
                );
              })}
            </Flex>

            <Flex gap={8} align="center" style={{ flexWrap: "wrap", alignItems: "center" }}>
              <label className={style.textUpdated}>Replacement:</label>
              {worklogDetail?.replacementEmployee?.length ? (
                worklogDetail.replacementEmployee.map((e) => (
                  <Tooltip key={e.userId} title={`Replacing: ${e.fullName}`} placement="top">
                    <div className={style.replacementBadge}>
                      <Flex align="center" vertical gap={6}>
                        <Badge
                          count={
                            <Icons.delUser
                              className={style.deleteIcon}
                              onClick={(event) => {
                                event.stopPropagation();
                                handleRemoveReplacement(e.userId);
                              }}
                            />
                          }
                          offset={[5, -3]}
                          style={{ backgroundColor: "white", cursor: "pointer" }}
                        >
                          <UserAvatar avatarURL={e.avatar || undefined} size={25} />
                          <span className={style.replacementText}>{e.replaceUserFullName}</span>
                        </Badge>
                      </Flex>
                    </div>
                  </Tooltip>
                ))
              ) : (
                <span className={style.noReplacementText}>No replacement assigned</span>
              )}
            </Flex>

            <Flex gap={15}>
              <label className={style.textUpdated}>Reporter:</label>
              <Tooltip
                title={
                  worklogDetail?.reporter[0]?.statusOfUserWorkLog === "Rejected"
                    ? "Rejected"
                    : worklogDetail?.reporter[0]?.statusOfUserWorkLog === "BeReplaced"
                    ? "Being Replaced"
                    : "Received"
                }
              >
                <Flex align="center" gap={8}>
                  <UserAvatar
                    avatarURL={worklogDetail?.reporter[0]?.avatarURL || undefined}
                    size={30}
                  />
                  <label
                    style={{
                      color:
                        worklogDetail?.reporter[0]?.statusOfUserWorkLog === "Rejected"
                          ? "red"
                          : worklogDetail?.reporter[0]?.statusOfUserWorkLog === "BeReplaced"
                          ? "goldenrod"
                          : "#bcd379",
                      fontSize: 16,
                    }}
                  >
                    {worklogDetail?.reporter[0]?.fullName || "Alex Johnson"}
                  </label>
                </Flex>
              </Tooltip>
            </Flex>

            <Divider className={style.divider} />
            <Flex gap={15}>
              <label className={style.textUpdated}>Working Time:</label>
              <label className={style.actualTime}>
                {worklogDetail?.actualStartTime || "N/A"} - {worklogDetail?.actualEndTime || "N/A"}
              </label>
            </Flex>
            <Flex gap={15}>
              <label className={style.textUpdated}>Date:</label>
              <label className={style.actualTime}>
                {formatDate(worklogDetail?.date || "") || "N/A"}
              </label>
            </Flex>
            <Flex gap={15}>
              <label className={style.textUpdated}>Start Date Plan:</label>
              <label className={style.actualTime}>
                {worklogDetail?.startDate ? formatDate(worklogDetail?.startDate) : "N/A"}
              </label>
            </Flex>
            <Flex gap={15}>
              <label className={style.textUpdated}>End Date Plan:</label>
              <label className={style.actualTime}>
                {worklogDetail?.endDate ? formatDate(worklogDetail?.endDate) : "N/A"}
              </label>
            </Flex>
            <Flex gap={15}>
              <label className={style.textUpdated}>Supplementary Worklog:</label>
              {worklogDetail?.redoWorkLog ? (
                <CustomButton
                  label="View Detail"
                  handleOnClick={() =>
                    navigate(`/hr-management/worklogs/${worklogDetail?.redoWorkLog.workLogId}`)
                  }
                />
              ) : (
                <label className={style.actualTime}>N/A</label>
              )}
            </Flex>
          </Flex>
        </Flex>
        <Flex justify="flex-end" gap={25}>
          {warning && (
            <p style={{ color: "red", fontWeight: 500 }}>
              {warning.message}{" "}
              <span style={{ color: "blue", fontWeight: 600 }}>{warning.names.join(", ")}</span>
            </p>
          )}
          <Button onClick={() => setIsEditModalVisible(true)}>Edit</Button>
        </Flex>
      </Flex>

      <AttendanceModal
        visible={isAttendanceModalVisible}
        worklogId={Number(id) || 0}
        onClose={handleCloseAttendanceModal}
        employees={worklogDetail?.listEmployee || []}
        reporter={worklogDetail?.reporter || []}
        attendanceStatus={attendanceStatus}
        onAttendanceChange={handleAttendanceChange}
        onSave={handleSaveAttendance}
        isTakeAttendance={worklogDetail?.isTakeAttendance || false}
      />

      <EditWorklogModal
        visible={isEditModalVisible}
        onClose={handleCloseEditModal}
        employees={worklogDetail?.listEmployee || []}
        reporter={worklogDetail?.reporter || []}
        id={Number(id)}
        attendanceStatus={attendanceStatus}
        onReplaceEmployee={handleReplaceEmployee}
        selectedTimeRange={selectedTimeRange}
        onTimeRangeChange={setSelectedTimeRange}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onSave={handleSaveEdit}
        replacementEmployees={worklogDetail?.replacementEmployee || []}
        worklog={worklogDetail}
        initialReporterId={initialReporterId}
      />

      <Divider className={style.divider} />

      <Flex className={style.contentSectionBody} gap={20}>
        <Flex className={style.col}>
          {infoFieldsLeft.map((field, index) => (
            <InfoField
              key={index}
              icon={field.icon}
              label={field.label}
              value={field.value}
              planId={worklogDetail?.planId}
              processId={worklogDetail?.processId}
              handleViewDetail={() => handleViewDetail(worklogDetail?.harvestHistoryId || 0)}
            />
          ))}
        </Flex>
        <Flex className={style.col}>
          {infoFieldsRight.map((field, index) => (
            <InfoField
              key={index}
              icon={field.icon}
              label={field.label}
              value={field.value}
              isTag={field.isTag}
              isHarvest={field.label === "Harvest" ? field.isHarvest : false}
              planId={worklogDetail?.planId}
              processId={worklogDetail?.processId}
              handleViewDetail={() => handleViewDetail(worklogDetail?.harvestHistoryId || 0)}
            />
          ))}
        </Flex>
      </Flex>

      <Divider className={style.divider} />

      <TimelineNotes notes={worklogDetail?.listNoteOfWorkLog || []} />

      <Divider className={style.divider} />

      <PlanTargetTable
        data={
          worklogDetail?.planTargetModels
            ? transformPlanTargetData(worklogDetail.planTargetModels)
            : []
        }
      />

      <Divider className={style.divider} />

      <Divider className={style.divider} />

      <Flex vertical justify="space-between" align="center" className={style.feedbackSection}>
        <h2 className={style.feedbackTitle}>Feedback</h2>
        {feedbackList.length > 0 ? (
          <div className={style.feedbackContent}>
            {feedbackList.map((item, index) => (
              <div
                key={index}
                className={`${style.feedbackItem} ${
                  worklogDetail?.status === "Redo" || worklogDetail?.status === "Failed"
                    ? style.redoBackground
                    : style.doneBackground
                }`}
              >
                <Image
                  src={item.avatarURL}
                  width={40}
                  height={40}
                  className={style.avt}
                  preview={false}
                  crossOrigin="anonymous"
                />
                <div className={style.feedbackText}>
                  <Flex vertical>
                    <Flex gap={20} align="center">
                      <div className={style.feedbackName}>{item.fullName}</div>
                      <div className={style.feedbackDate}>{formatDateW(item.createDate)}</div>
                    </Flex>
                    <div className={style.feedbackMessage}>{item.content}</div>
                  </Flex>
                  {worklogDetail && ["Redo", "Failed"].includes(worklogDetail.status) && (
                    <Flex vertical={false}>
                      {["Redo", "Failed"].includes(worklogDetail.status) &&
                        !worklogDetail.redoWorkLog && (
                          <Button
                            className={style.updateButton}
                            onClick={() => handleUpdateFeedback(item)}
                          >
                            Update
                          </Button>
                        )}
                      {/* <Button
                        className={style.deleteButton}
                        onClick={() => handleOpenDeleteModal(item)}
                        disabled
                      >
                        Delete
                      </Button> */}
                      {["Redo", "Failed"].includes(worklogDetail.status) &&
                        !worklogDetail.redoWorkLog && (
                          <Button
                            className={style.reassignButton}
                            onClick={() => setIsRedoModalOpen(true)}
                          >
                            Re-assign
                          </Button>
                        )}
                    </Flex>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={style.noFeedback}>Chưa có feedback</div>
        )}
        {worklogDetail?.status === "Reviewing" || worklogDetail?.status === "Overdue" ? (
          <Button onClick={handleFeedback} className={style.btnFeedback}>
            Feedback
          </Button>
        ) : worklogDetail?.status === "Not Started" ||
          worklogDetail?.status === "In Progress" ||
          worklogDetail?.status === "On Redo" ? (
          <>
            <Button onClick={handleFeedback} disabled className={style.btnFeedback}>
              Feedback
            </Button>
            <p className={style.informFb}>
              The employee has not completed the task yet. Please check back later.
            </p>
          </>
        ) : null}
      </Flex>

      <FeedbackModal
        isOpen={formModal.modalState.visible}
        onClose={handleCloseModal}
        onSave={handleAdd}
        worklogId={Number(id)}
        managerId={Number(getUserId())}
        onSuccess={fetchPlanDetail}
        feedbackData={selectedFeedback}
      />
      <ConfirmModal
        visible={isDeleteModalVisible}
        onConfirm={handleDeleteFeedback}
        onCancel={() => setIsDeleteModalVisible(false)}
        actionType="delete"
        itemName="feedback"
        title="Delete Feedback?"
        description="Are you sure you want to delete this feedback? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
      />
      <RedoWorklogModal
        isOpen={isRedoModalOpen}
        onClose={() => setIsRedoModalOpen(false)}
        onSuccess={fetchPlanDetail}
        failedOrRedoWorkLogId={worklogDetail?.workLogId || 0}
      />
      <DependencyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        worklogId={worklogDetail?.workLogId || 0}
      />

      <Modal
        title="Confirm Completion"
        open={isConfirmModalOpen}
        onOk={handleConfirm}
        onCancel={() => setIsConfirmModalOpen(false)}
        okText="Yes"
        cancelText="No"
      >
        <p>Are you sure you want to mark this worklog as completed?</p>
      </Modal>
      <ToastContainer />
    </div>
  );
}

export default WorklogDetail;
