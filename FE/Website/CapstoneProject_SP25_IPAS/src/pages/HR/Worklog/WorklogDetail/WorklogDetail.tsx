import { Button, DatePicker, Divider, Flex, Image, Tag } from "antd";
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
import { GetWorklogDetail, ListEmployeeUpdate, TaskFeedback, UpdateWorklogReq } from "@/payloads/worklog";
import { formatDate, formatDateW, getUserId } from "@/utils";
import { getUserById } from "@/services/UserService";
import { GetUser, PlanTarget, PlanTargetModel } from "@/payloads";
import { ConfirmModal, Tooltip } from "@/components";
import PlanTargetTable from "@/pages/Plan/PlanDetails/PlanTargetTable";
import EmployeeDropdown from "./EmployeeDropdown";
import moment from "moment";
import EditableTimeRangeField from "./EditableTimeField";
import AttendanceModal from "./AttendanceModal";
import EditWorklogModal from "./EditWorklogModal";
import { Dayjs } from "dayjs";

const InfoField = ({
    icon: Icon,
    label,
    value,
    isTag = false,
}: {
    icon: React.ElementType;
    label: string;
    value: string | React.ReactNode;
    isTag?: boolean;
}) => (
    <Flex className={style.infoField}>
        <Flex className={style.fieldLabelWrapper}>
            <Icon className={style.fieldIcon} />
            <label className={style.fieldLabel}>{label}:</label>
        </Flex>
        <label className={style.fieldValue}>
            {isTag ? <Tag color="green">{value}</Tag> : value}
        </label>
    </Flex>
);

function WorklogDetail() {
    const navigate = useNavigate();
    const formModal = useModal<GetFeedback>();
    const [feedback, setFeedback] = useState<string>("");
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
    const [selectedTimeRange, setSelectedTimeRange] = useState<[string, string]>([
        worklogDetail?.actualStartTime || "",
        worklogDetail?.actualEndTime || "",
    ]);
    const [selectedDate, setSelectedDate] = useState<string>(worklogDetail?.date || "");
    const [replacementEmployees, setReplacementEmployees] = useState<
        { replacedUserId: number; replacementUserId: number }[]
    >([]);

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

    const handleSaveEdit = async () => {
        if (!worklogDetail || !id) return;

        try {
            const listEmployeeUpdate: ListEmployeeUpdate[] = [];

            worklogDetail.replacementEmployee?.forEach((replacement) => {
                const replacedEmployee = worklogDetail.listEmployee.find(
                    (emp) => emp.userId === replacement.replaceUserId
                );
                console.log("replacedEmployee", replacedEmployee);


                if (replacedEmployee) {
                    listEmployeeUpdate.push({
                        oldUserId: replacedEmployee.userId,
                        newUserId: replacement.userId,
                        isReporter: replacedEmployee.userId === worklogDetail.reporter[0].userId ? true : false,
                        status: replacedEmployee.userId === worklogDetail.reporter[0].userId ? "update" : "add",
                    });
                }
            });

            const replacedReporter = worklogDetail.replacementEmployee?.find(
                (replacement) => replacement.replaceUserId === worklogDetail.reporter[0].userId
            );

            if (replacedReporter) {
                listEmployeeUpdate.push({
                    oldUserId: replacedReporter.replaceUserId,
                    newUserId: replacedReporter.userId,
                    isReporter: true,
                    status: "update",
                });
            }

            const payload: UpdateWorklogReq = {
                workLogId: Number(id),
                listEmployeeUpdate: listEmployeeUpdate,
                dateWork: selectedDate,
                startTime: selectedTimeRange[0],
                endTime: selectedTimeRange[1],
            };
            console.log("8888888", payload);

            const response = await worklogService.updateWorklog(payload);

            if (response && response.statusCode === 200) {
                toast.success("Worklog updated successfully!");
                await fetchPlanDetail();
                setIsEditModalVisible(false);
            } else {
                toast.error("Failed to update worklog.");
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
            setFeedbackList(feedbackList.filter(fb => fb.taskFeedbackId !== selectedFeedbackToDelete.taskFeedbackId));
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
    ]);
    const addModal = useModal<CreateFeedbackRequest>();

    const handleFeedback = () => {
        formModal.showModal();
    };

    const handleAdd = () => {
        // Handle add feedback
    }

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

    const fetchPlanDetail = async () => {
        try {
            const res = await worklogService.getWorklogDetail(Number(id));
            console.log("res", res);
            const imsotired = transformPlanTargetData(res.planTargetModels);
            console.log("imsotired", imsotired);

            setWorklogDetail(res);
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
                { label: "Plan Name", value: res.workLogName || "Plan name", icon: Icons.box },
                { label: "Growth Stage", value: res.listGrowthStageName.join(", ") || "Cây non", icon: Icons.plant },
            ]);

            setInfoFieldsRight([
                { label: "Process Name", value: res.processName || "None", icon: Icons.process },
                { label: "Type", value: res.masterTypeName || "Watering", icon: Icons.category, isTag: true },
            ]);

            infoFieldsRight[0].value = res.workLogName || "Caring Process for Pomelo Tree";
            infoFieldsRight[1].value = res.status || "Watering";
            // infoFieldsRight[2].value = res.planTargetModels[0]?.plantLotName.join(", ") || "#001";
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
        const listEmployee = worklogDetail?.listEmployee.map((employee) => ({
            userId: employee.userId,
            status: attendanceStatus[employee.userId] || "Rejected", // Mặc định là vắng mặt nếu không chọn
        })) || [];

        try {
            const resultAttendance = await worklogService.saveAttendance(Number(id), listEmployee);
            if (resultAttendance && resultAttendance.statusCode === 200) {
                toast.success(resultAttendance.message);
                await fetchPlanDetail();
            } else {
                toast.error(resultAttendance.message);
            }
            // Cập nhật lại dữ liệu
            setIsAttendanceModalVisible(false); // Đóng modal
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
            isReporter: employee.userId === userId ? isReporter : false, // Chỉ có một reporter duy nhất
        }));

        setWorklogDetail({
            ...worklogDetail,
            listEmployee: updatedEmployees,
        });
    };

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
                <Tag className={`${style.statusTag} ${style.normal}`}>{worklogDetail?.status || "Pending"}</Tag>
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
                            {isEditing ? (
                                <EmployeeDropdown
                                    employees={worklogDetail?.listEmployee || []}
                                    selectedEmployee={worklogDetail?.listEmployee[0]}
                                    onChange={(userId) => {
                                        const selectedEmployee = worklogDetail?.listEmployee.find((emp) => emp.userId === userId);
                                        setWorklogDetail({
                                            ...worklogDetail!,
                                            listEmployee: selectedEmployee ? [selectedEmployee] : [],
                                        });
                                    }}
                                />
                            ) : (
                                <>
                                    {worklogDetail?.listEmployee?.map((employee, index) => (
                                        <>
                                            <Image
                                                src={employee.avatarURL || Images.avatar}
                                                width={25}
                                                className={style.avt}
                                                crossOrigin="anonymous"
                                            />
                                            <label className={style.createdBy}>
                                                {employee.fullName || "Unknown"}
                                            </label>
                                        </>
                                    ))}
                                </>
                            )}
                        </Flex>
                        <Flex gap={15}>
                        <label className={style.textUpdated}>Replacement Employee:</label>
                            {worklogDetail?.replacementEmployee.map((e) => (
                                <>
                                <Tooltip title={e.replaceUserFullName || ""}>
                                    <Image
                                        src={e.avatar || Images.avatar}
                                        width={25}
                                        className={style.avt}
                                        crossOrigin="anonymous"
                                    />
                                    <label className={style.createdBy}>{e.fullName || "Alex Johnson"}</label>
                                    </Tooltip>
                                </>
                            ))}
                            

                        </Flex>
                        <Flex gap={15}>
                            <label className={style.textUpdated}>Reporter:</label>
                            <Image
                                src={worklogDetail?.reporter[0]?.avatarURL || Images.avatar}
                                width={25}
                                className={style.avt}
                                crossOrigin="anonymous"
                            />
                            <label className={style.createdBy}>{worklogDetail?.reporter[0]?.fullName || "Alex Johnson"}</label>
                        </Flex>
                        <Divider className={style.divider} />
                        <Flex gap={15}>
                            <label className={style.textUpdated}>Working Time:</label>
                            {isEditing ? (
                                <EditableTimeRangeField
                                    value={[
                                        worklogDetail?.actualStartTime || "",
                                        worklogDetail?.actualEndTime || "",
                                    ]}
                                    onChange={(newValue) =>
                                        setWorklogDetail({
                                            ...worklogDetail!,
                                            actualStartTime: newValue[0],
                                            actualEndTime: newValue[1],
                                        })
                                    }
                                />
                            ) : (
                                <label className={style.actualTime}>
                                    {worklogDetail?.actualStartTime || "N/A"} - {worklogDetail?.actualEndTime || "N/A"}
                                </label>
                            )}
                        </Flex>
                        <Flex gap={15}>
                            <label className={style.textUpdated}>Date:</label>
                            {isEditing ? (
                                <DatePicker
                                    value={worklogDetail?.date ? moment(worklogDetail.date) : null}
                                    onChange={(date, dateString) =>
                                        setWorklogDetail({ ...worklogDetail!, date: dateString.toString() })
                                    }
                                />
                            ) : (
                                <label className={style.actualTime}>{formatDate(worklogDetail?.date || "") || "N/A"}</label>
                            )}
                        </Flex>
                    </Flex>
                </Flex>
                <Flex justify="flex-end">
                    {isEditing ? (
                        <>
                            <Button onClick={handleSave}>Save</Button>
                            <Button onClick={() => setIsEditing(false)}>Cancel</Button>
                        </>
                    ) : (
                        <Button onClick={() => setIsEditModalVisible(true)}>Edit</Button>
                    )}
                </Flex>
            </Flex>

            <AttendanceModal
                visible={isAttendanceModalVisible}
                onClose={() => setIsAttendanceModalVisible(false)}
                employees={worklogDetail?.listEmployee || []}
                reporter={worklogDetail?.reporter || []}
                attendanceStatus={attendanceStatus}
                onAttendanceChange={handleAttendanceChange}
                onSave={handleSaveAttendance}
            />

            <EditWorklogModal
                visible={isEditModalVisible}
                onClose={() => setIsEditModalVisible(false)}
                employees={worklogDetail?.listEmployee || []}
                reporter={worklogDetail?.reporter || []}
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
                        <InfoField key={index} icon={field.icon} label={field.label} value={field.value} />
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
                        />
                    ))}
                </Flex>
            </Flex>

            <Divider className={style.divider} />

            <TimelineNotes notes={worklogDetail?.listNoteOfWorkLog || []} />

            <Divider className={style.divider} />

            <PlanTargetTable
                data={worklogDetail?.planTargetModels ? transformPlanTargetData(worklogDetail.planTargetModels) : []}
            />

            <Divider className={style.divider} />

            <WeatherAlerts />

            <Divider className={style.divider} />

            {/* Feedback */}

            <Flex vertical justify="space-between" align="center" className={style.feedbackSection}>
                {feedbackList.length > 0 ? (
                    <div className={style.feedbackContent}>
                        {feedbackList.map((item, index) => (
                            <div
                                key={index}
                                className={`${style.feedbackItem} ${worklogDetail?.status === "Redo" ? style.redoBackground : style.doneBackground}`}
                            >
                                <Image
                                    src={"https://via.placeholder.com/40"}
                                    width={40}
                                    height={40}
                                    className={style.avt}
                                    preview={false}
                                    crossOrigin="anonymous"
                                />
                                <div className={style.feedbackText}>
                                    <Flex vertical>
                                        <div className={style.feedbackName}>{manager?.fullName}</div>
                                        <div className={style.feedbackMessage}>{item.content}</div>
                                    </Flex>
                                    {worklogDetail?.status === "Redo" && (
                                        <Flex vertical={false}>
                                            <Button
                                                className={style.updateButton}
                                                onClick={() => handleUpdateFeedback(item)}
                                            >
                                                Update
                                            </Button>
                                            <Button className={style.deleteButton} onClick={() => handleOpenDeleteModal(item)} disabled>Delete</Button>
                                            <Button
                                                className={style.reassignButton}
                                                onClick={() => navigate("/hr-management/worklogs")}
                                            >
                                                Re-assign
                                            </Button>
                                        </Flex>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={style.noFeedback}>Chưa có feedback</div>
                )}
                {
                    (worklogDetail?.status === "Reviewing" ||
                        worklogDetail?.status === "Overdue") ? (
                        <Button onClick={handleFeedback} className={style.btnFeedback}>
                            Feedback
                        </Button>
                    ) :
                        worklogDetail?.status === "Not Started" ||
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
                        ) :
                            null
                }
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
            <ToastContainer />
        </div>
    )
}

export default WorklogDetail;