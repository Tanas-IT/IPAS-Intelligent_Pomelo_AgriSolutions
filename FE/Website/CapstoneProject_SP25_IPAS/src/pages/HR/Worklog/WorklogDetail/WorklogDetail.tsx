import { Avatar, Badge, Button, DatePicker, Divider, Flex, Image, Tag } from "antd";
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
import WeatherAlerts from "./WeatherAlerts/WeatherAlerts";
import { feedbackService, worklogService } from "@/services";
import { CancelReplacementRequest, GetAttendanceList, GetWorklogDetail, ListEmployeeUpdate, TaskFeedback, UpdateWorklogReq } from "@/payloads/worklog";
import { formatDate, formatDateW, getUserId } from "@/utils";
import { getUserById } from "@/services/UserService";
import { GetUser, PlanTarget, PlanTargetModel } from "@/payloads";
import { ConfirmModal, CustomButton, Loading, Tooltip } from "@/components";
import PlanTargetTable from "@/pages/Plan/PlanDetails/PlanTargetTable";
import EmployeeDropdown from "./EmployeeDropdown";
import moment from "moment";
import EditableTimeRangeField from "./EditableTimeField";
import AttendanceModal from "./AttendanceModal";
import EditWorklogModal from "./EditWorklogModal";
import { Dayjs } from "dayjs";
import RedoWorklogModal from "./RedoWorklogModal";
import { statusIconMap } from "@/constants/statusMap";

const InfoField = ({
  icon: Icon,
  label,
  value,
  planId,
  processId,
  isTag = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string | React.ReactNode;
  planId?: number;
  processId?: number;
  isTag?: boolean;
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
  const [manager, setManager] = useState<GetUser | null>(null);
  const [feedbackList, setFeedbackList] = useState<TaskFeedback[]>([]);
  const { id } = useParams();
  const [worklogDetail, setWorklogDetail] = useState<GetWorklogDetail>();
  const [selectedFeedback, setSelectedFeedback] = useState<TaskFeedback>();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedFeedbackToDelete, setSelectedFeedbackToDelete] = useState<TaskFeedback | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAttendanceModalVisible, setIsAttendanceModalVisible] = useState(false);
  const [attendanceData, setAttendanceData] = useState<{ userId: number; isPresent: boolean }[]>([]);
  const [attendanceStatus, setAttendanceStatus] = useState<{ [key: number]: string | null }>({});
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRedoModalOpen, setIsRedoModalOpen] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<[string, string]>([
    worklogDetail?.actualStartTime || "",
    worklogDetail?.actualEndTime || "",
  ]);
  const [selectedDate, setSelectedDate] = useState<string>(worklogDetail?.date || "");
  const [replacementEmployees, setReplacementEmployees] = useState<
    { replacedUserId: number; replacementUserId: number }[]
  >([]);

  const rawStatus = worklogDetail?.status || 'Not Started';
  const normalizedStatus = rawStatus.toLowerCase();
  const classKey = normalizedStatus.replace(/\s+/g, ''); // dùng cho SCSS
  const statusClass = style[classKey] || style.default;
  const icon = statusIconMap[normalizedStatus] || '❓';

  const handleUpdateFeedback = (feedback: TaskFeedback) => {
    setSelectedFeedback(feedback);
    formModal.showModal();
  };
  console.log("id", id);


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
        ? { ...employee, status: "Replaced" }
        : employee
    );

    const updatedReporter = worklogDetail.reporter.map((rep) =>
      rep.userId === replaceUserId
        ? { ...rep, status: "Replaced" }
        : rep
    );

    const updatedReplacementEmployees = [
      ...(worklogDetail.replacementEmployee || []),
      { replaceUserId, userId: replacementUserId },
    ];

    setWorklogDetail({
      ...worklogDetail,
      listEmployee: updatedEmployees || [],
      // reporter: updatedReporter,
      replacementEmployee: updatedReplacementEmployees,
    });
  };

  const handleRemoveReplacement = async (replaceUserId: number) => {
    if (!worklogDetail) return;

    const updatedReplacementEmployees = worklogDetail.replacementEmployee?.filter(
      (rep) => rep.replaceUserId !== replaceUserId
    );
    const updatedEmployees = worklogDetail.listEmployee.map((employee) =>
      employee.userId === replaceUserId ? { ...employee, status: 'Received' } : employee
    );

    setWorklogDetail({
      ...worklogDetail,
      listEmployee: updatedEmployees,
      replacementEmployee: updatedReplacementEmployees,
    });

    // await fetchWorklogDetail(); // Gọi lại API để đồng bộ
  };

  const handleSaveEdit = async () => {
    if (!worklogDetail || !id) return;

    try {
      const listEmployeeUpdate: ListEmployeeUpdate[] = [];

      // 1. Xử lý thay thế reporter (nếu có)
      const replacedReporter = worklogDetail.replacementEmployee?.find(
        (replacement) => replacement.replaceUserId === worklogDetail.reporter[0].userId
      );

      if (replacedReporter) {
        const originalReporter = worklogDetail.reporter[0];
        const isRejected = originalReporter.statusOfUserWorkLog === "Rejected";

        listEmployeeUpdate.push({
          oldUserId: replacedReporter.replaceUserId,
          newUserId: replacedReporter.userId,
          isReporter: true,
          status: isRejected ? "add" : "update", // Xử lý theo status
        });
      }

      // 2. Xử lý thay thế các nhân viên khác
      worklogDetail.replacementEmployee?.forEach((replacement) => {
        // Bỏ qua nếu đã xử lý reporter ở trên
        if (replacement.replaceUserId === worklogDetail.reporter[0]?.userId) return;

        const originalEmployee = worklogDetail.listEmployee.find(
          (emp) => emp.userId === replacement.replaceUserId
        );

        if (originalEmployee) {
          const isReporterReplacement = worklogDetail.reporter.some(
            (rep) => rep.userId === replacement.replaceUserId
          );
          const isRejected = originalEmployee.statusOfUserWorkLog === "Rejected";

          listEmployeeUpdate.push({
            oldUserId: replacement.replaceUserId,
            newUserId: replacement.userId,
            isReporter: isReporterReplacement,
            status: isRejected ? "add" : "update", // Xử lý theo status
          });
        }
      });

      // 3. Gửi payload
      const payload: UpdateWorklogReq = {
        workLogId: Number(id),
        listEmployeeUpdate: listEmployeeUpdate,
        dateWork: selectedDate,
        startTime: selectedTimeRange[0],
        endTime: selectedTimeRange[1],
      };

      console.log("Final payload:", payload);

      const response = await worklogService.updateWorklog(payload);

      if (response?.statusCode === 200) {
        toast.success("Worklog updated successfully!");
        await fetchPlanDetail();
        setIsEditModalVisible(false);
      } else {
        toast.error(response?.message || "Failed to update worklog.");
      }
    } catch (error) {
      console.error("Error updating worklog:", error);
      toast.error("An error occurred while updating the worklog.");
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
    { label: "Crop", value: "Spring 2025", icon: Icons.growth },
    { label: "Plan Name", value: "Plan name", icon: Icons.box },
    { label: "Growth Stage", value: "Cây non", icon: Icons.plant },
  ]);

  const [infoFieldsRight, setInfoFieldsRight] = useState([
    { label: "Process Name", value: "Caring Process for Pomelo Tree", icon: Icons.process },
    { label: "Type", value: "Watering", icon: Icons.category, isTag: true },
    { label: "Harvest", value: "Harvest", icon: Icons.category, isTag: false },
  ]);
  const addModal = useModal<CreateFeedbackRequest>();

  const handleFeedback = () => {
    formModal.showModal();
  };

  const handleAdd = () => {
    // Handle add feedback
  };

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
    console.log("planTargetModels in worklog", planTargetModels);

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
      ...workLog.listEmployee.filter(emp => emp.statusOfUserWorkLog === "Rejected"),
      ...workLog.reporter.filter(rep => rep.statusOfUserWorkLog === "Rejected")
    ];

    const replacedUserIds = workLog.replacementEmployee.map(replacement => replacement.userId);

    const employeesNeedingReassignment = rejectedEmployees.filter(
      emp => !replacedUserIds.includes(emp.userId)
    );

    if (employeesNeedingReassignment.length > 0) {
      const namesNeedingReassignment = employeesNeedingReassignment.map(emp => emp.fullName);
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
      const res = await worklogService.getWorklogDetail(Number(id));
      console.log("res", res);
      // const imsotired = transformPlanTargetData(res?.planTargetModels);
      // console.log("imsotired", imsotired);

      setWorklogDetail(res);
      checkAndNotifyReassignment(res);
      // const initialAttendanceStatus = res.listEmployee.reduce((acc, employee) => {
      //     acc[employee.userId] = employee.statusOfUserWorkLog === "Received" ? "Received" : "Rejected";
      //     return acc;
      // }, {} as { [key: number]: "Received" | "Rejected" });
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
      console.log("initialAttendanceStatus", initialAttendanceStatus);

      setAttendanceStatus(initialAttendanceStatus);
      setFeedbackList(res.listTaskFeedback || []);
      setSelectedTimeRange([res.actualStartTime, res.actualEndTime]);
      const date = new Date(res.date);
      setSelectedDate(new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString());

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
          value: res.masterTypeName || "Watering",
          icon: Icons.category,
          isTag: true,
        },
        {
          label: "Harvest",
          value: res.isHarvest ? "Yes" : "No",
          icon: Icons.category,
        },
      ]);

      infoFieldsRight[0].value = res.workLogName || "Caring Process for Pomelo Tree";
      infoFieldsRight[1].value = res.status || "Watering";
      // infoFieldsRight[2].value = res.planTargetModels[0]?.plantLotName.join(", ") || "#001";
      console.log('1111');

    } catch (error) {
      console.error("error", error);
      navigate("/error");
    }
  };

  useEffect(() => {
    if (!id) {
      navigate("/404");
      return;
    }

    fetchPlanDetail();
  }, [id]);

  const handleSave = async () => {
    try {
      //   await worklogService.updateWorklog(Number(id), worklogDetail);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating worklog:", error);
    }
  };

  const handleTakeAttendance = () => {
    setIsAttendanceModalVisible(true);
  };

  const handleSaveAttendance = async () => {
    console.log("...........................");
    const allUsers = [
      ...(worklogDetail?.listEmployee || []),
      ...(worklogDetail?.reporter || [])
    ];

    const listEmployee = allUsers.map(user => ({
      userId: user.userId,
      status: attendanceStatus[user.userId] || "Rejected",
    }));
    console.log('payloadđ', listEmployee);


    try {
      const canCheck = await worklogService.canTakeAttendance(Number(id));
      console.log("canCheck", canCheck);

      if (canCheck.statusCode !== 200 || !canCheck.data) {
        toast.error(canCheck.message);
        return;
      }

      const resultAttendance = await worklogService.saveAttendance(Number(id), listEmployee);
      if (resultAttendance && resultAttendance.statusCode === 200) {
        toast.success(resultAttendance.message);
        await fetchPlanDetail();
      } else {
        toast.error(resultAttendance.message);
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

  const handleUpdateReporter = (userId: number, isReporter: boolean) => {
    if (!worklogDetail) return;
    const updatedEmployees = worklogDetail.listEmployee.map((employee) => ({
      ...employee,
      isReporter: employee.userId === userId ? isReporter : false,
    }));

    setWorklogDetail({
      ...worklogDetail,
      listEmployee: updatedEmployees,
    });
  };

  const onRemoveReplacement = async (userId: number) => {
    if (!worklogDetail) return;
    const payload: CancelReplacementRequest = {
      worklogId: Number(id),
      userId: userId,
    }
    try {
      await worklogService.cancelReplacement(payload);
      toast.success("Removed successfully!");
      fetchPlanDetail();
    } catch (error) {
      console.error("Error removing replacement:", error);
      toast.error("Failed to remove replacement.");
    }
  }

  const handleCloseEditModal = () => {
    setIsEditModalVisible(false);
    setSelectedTimeRange(selectedTimeRange);
    setSelectedDate(selectedDate);
    fetchPlanDetail();
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
          <Icons.back className={style.backIcon} onClick={() => navigate(PATHS.HR.WORKLOG_CALENDAR)} />
        </Tooltip>
      </Flex>
      <Divider className={style.divider} />
      <Flex className={style.contentSectionTitleLeft}>
        <p className={style.title}>{worklogDetail?.workLogName || "Caring Process"}</p>
        <Tooltip title="Hello">
          <Icons.tag className={style.iconTag} />
        </Tooltip>
        {/* <Tag className={`${style.statusTag} ${style.normal}`}>{worklogDetail?.status || "Pending"}</Tag> */}
        <Tag className={`${style.statusTag} ${statusClass}`}>
          <span style={{ marginRight: 6 }}>{icon}</span>
          {rawStatus}
        </Tag>
        <Flex gap={15}>
          <Button onClick={handleTakeAttendance}>Take Attendance</Button>
        </Flex>
      </Flex>
      <label className={style.subTitle}>Code: {worklogDetail?.workLogCode || "laggg"}</label>

      <Flex vertical gap={10} className={style.contentSectionUser}>
        <Flex vertical>
          <Flex vertical={false} gap={15}>
            <Image
              src={worklogDetail?.reporter[0]?.avatarURL || Images.avatar}
              width={25}
              className={style.avt}
              crossOrigin="anonymous"
            />
            <label className={style.createdBy}>{worklogDetail?.reporter[0]?.fullName || "laggg"}</label>
            <label className={style.textCreated}>created this plan</label>
            <label className={style.createdDate}>{formatDateW(worklogDetail?.date ?? "2")}</label>
          </Flex>
          <Flex vertical gap={10} className={style.info}>
            <Flex gap={15}>
              <label className={style.textUpdated}>Assigned To:</label>
              {worklogDetail?.listEmployee?.map((employee, index) => {
                const isRejected = employee.statusOfUserWorkLog === "Rejected";
                const isBeReplaced = employee.statusOfUserWorkLog === "BeReplaced";
                const borderColor = isRejected ? "red" : isBeReplaced ? "goldenrod" : "none";
                const textColor = isRejected ? "red" : isBeReplaced ? "goldenrod" : "#bcd379";
                const tooltipText = isRejected ? "Rejected" : isBeReplaced ? "Being Replaced" : "Received";
                console.log("employeeeeeee", employee);
                console.log("isRejected", isRejected);
                console.log("isBeReplaced", isBeReplaced);
                console.log("borderColor", borderColor);
                console.log("textColor", textColor);


                return (
                  <Tooltip key={index} title={tooltipText}>
                    <Flex align="center">
                      <Image
                        src={employee.avatarURL || Images.avatar}
                        width={25}
                        className={style.avt}
                        crossOrigin="anonymous"
                      // style={{ border: `2px solid ${borderColor}` }}
                      />
                      <label className={style.createdBy} style={{ color: textColor }}>
                        {employee.fullName || "Unknown"}
                      </label>
                    </Flex>
                  </Tooltip>
                );
              })}
            </Flex>


            <Flex gap={8} align="center" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
              <label className={style.textUpdated}>Replacement:</label>

              {worklogDetail?.replacementEmployee?.length ? (
                worklogDetail.replacementEmployee.map((e) => (
                  <Tooltip
                    key={e.userId}
                    title={`Replacing: ${e.fullName}`}
                    placement="top"
                  >
                    <div className={style.replacementBadge}>
                      <Flex align="center" gap={6}>
                        <Badge
                          count={
                            <Icons.delUser
                              className={style.deleteIcon}
                              onClick={(event) => {
                                event.stopPropagation();
                                onRemoveReplacement(e.userId);
                              }}
                            />
                          }
                          offset={[5, -3]}
                          style={{ backgroundColor: 'white', cursor: 'pointer' }}
                        >
                          <Image
                            src={e.avatar || Images.avatar}
                            width={25}
                            className={style.avt}
                            crossOrigin="anonymous"
                          />
                          <span className={style.replacementText}>
                            {e.replaceUserFullName}
                          </span>
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
                <Flex align="center">
                  <Image
                    src={worklogDetail?.reporter[0]?.avatarURL || Images.avatar}
                    width={25}
                    className={style.avt}
                    crossOrigin="anonymous"
                  // style={{
                  //   border:
                  //     worklogDetail?.reporter[0]?.statusOfUserWorkLog === "Rejected"
                  //       ? "2px solid red"
                  //       : worklogDetail?.reporter[0]?.statusOfUserWorkLog === "BeReplaced"
                  //         ? "2px solid goldenrod"
                  //         : "none",
                  // }}
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
              <label className={style.actualTime}>{formatDate(worklogDetail?.date || "") || "N/A"}</label>
            </Flex>
            <Flex gap={15}>
              <label className={style.textUpdated}>Supplementary Worklog:</label>
              {worklogDetail?.redoWorkLog ? (

                <CustomButton label="View Detail" handleOnClick={() => navigate(`/hr-management/worklogs/${worklogDetail?.redoWorkLog.workLogId}`)}/>
              ) : (
                <label className={style.actualTime}>N/A</label>
              )}
            </Flex>
          </Flex>
        </Flex>
        <Flex justify="flex-end" gap={25}>
          {warning && (
            <p style={{ color: 'red', fontWeight: 500 }}>
              {warning.message}{" "}
              <span style={{ color: 'blue', fontWeight: 600 }}>
                {warning.names.join(", ")}
              </span>
            </p>
          )}

          <Button onClick={() => setIsEditModalVisible(true)}>Edit</Button>
        </Flex>
      </Flex>

      <AttendanceModal
        visible={isAttendanceModalVisible}
        worklogId={Number(id) || 0}
        onClose={() => setIsAttendanceModalVisible(false)}
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
        onUpdateReporter={handleUpdateReporter}
        replacementEmployees={worklogDetail?.replacementEmployee || []}
      />

      <Divider className={style.divider} />

      {/* Plan Details */}
      <Flex className={style.contentSectionBody} gap={20}>
        <Flex className={style.col}>
          {infoFieldsLeft.map((field, index) => (
            <InfoField key={index} icon={field.icon} label={field.label} value={field.value} planId={worklogDetail?.planId} processId={worklogDetail?.processId} />
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
              planId={worklogDetail?.planId}
              processId={worklogDetail?.processId}
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

      {/* <WeatherAlerts /> */}

      <Divider className={style.divider} />

      {/* Feedback */}

      <Flex vertical justify="space-between" align="center" className={style.feedbackSection}>
        <h2 className={style.feedbackTitle}>Feedback</h2>
        {feedbackList.length > 0 ? (
          <div className={style.feedbackContent}>
            {feedbackList.map((item, index) => (
              <div
                key={index}
                className={`${style.feedbackItem} ${worklogDetail?.status === "Redo" || worklogDetail?.status === "Failed" ? style.redoBackground : style.doneBackground
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
                      {["Redo", "Failed"].includes(worklogDetail.status) && !worklogDetail.redoWorkLog && (
                        <Button
                          className={style.updateButton}
                          onClick={() => handleUpdateFeedback(item)}
                        >
                          Update
                        </Button>
                      )}

                      <Button
                        className={style.deleteButton}
                        onClick={() => handleOpenDeleteModal(item)}
                        disabled
                      >
                        Delete
                      </Button>
                      {["Redo", "Failed"].includes(worklogDetail.status) && !worklogDetail.redoWorkLog && (
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
        // isOpen={true}
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
        onSuccess={() => setIsRedoModalOpen(false)}
        failedOrRedoWorkLogId={worklogDetail?.workLogId || 0}
      />
      <ToastContainer />
    </div>
  );
}

export default WorklogDetail;
