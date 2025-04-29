import { PATHS } from "@/routes";
import style from "./PlanDetail.module.scss";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Divider, Flex, Image, Tag, Tooltip, Progress, Card, Empty, Spin } from "antd";
import { Icons, Images } from "@/assets";
import { CustomButton, Loading } from "@/components";
import StatusTag from "@/components/UI/StatusTag/StatusTag";
import { useCallback, useEffect, useState } from "react";
import { planService } from "@/services";
import {
  GetPlan,
  PlanNodes,
  PlanTargetModel,
  ProcessByPlanResponse,
  SubProcessNodes,
} from "@/payloads/plan";
import PlanTargetTable from "./PlanTargetTable";
import { formatDate, formatDateW, getFarmId } from "@/utils";
import ProcessFlow from "./ProcessFlow";

interface GeneralCalendarProps {
  selectedDays: number[];
}

interface PlanTarget {
  type: "Plot" | "Row" | "Plant" | "Plant Lot" | "Grafted Plant";
  plotNames?: string[];
  rowNames?: string[];
  plantNames?: string[];
  plantLotNames?: string[];
  graftedPlantNames?: string[];
}

const InfoField = ({
  icon: Icon,
  label,
  value,
  processId,
  isTag = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string | React.ReactNode;
  processId?: number;
  isTag?: boolean;
}) => {
  const navigate = useNavigate();
  const isProcessName = label === "Process Name" && value !== "None";

  return (
    <Flex className={style.infoField}>
      <Flex className={style.fieldLabelWrapper}>
        <Icon className={style.fieldIcon} />
        <label className={style.fieldLabel}>{label}:</label>
      </Flex>
      <Flex className={style.fieldValue}>
        {isProcessName ? (
          <span className={style.linkText} onClick={() => navigate(`/processes/${processId}`)}>
            {value}
          </span>
        ) : isTag ? (
          <Tag color="green">{value}</Tag>
        ) : (
          value
        )}
      </Flex>
    </Flex>
  );
};

function PlanDetail() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [processTree, setProcessTree] = useState<ProcessByPlanResponse | null>(null);
  const { id } = useParams<{ id: string }>();
  const [planDetail, setPlanDetail] = useState<GetPlan>();
  const [processError, setProcessError] = useState<string | null>(null);
  const numOfCompleted = planDetail?.listWorkLog.filter((p) => p.status === "Done").length ?? 0;
  const total = planDetail?.listWorkLog.length;

  const [infoFieldsLeft, setInfoFieldsLeft] = useState([
    { label: "Crop", value: planDetail?.cropName || "No data", icon: Icons.growth },
    { label: "Growth Stage", value: "Cây non", icon: Icons.plant },
  ]);

  const [infoFieldsRight, setInfoFieldsRight] = useState([
    { label: "Process Name", value: "Caring Process for Pomelo Tree", icon: Icons.process },
    { label: "Type", value: "Watering", icon: Icons.category, isTag: true },
  ]);

  const fetchPlanDetail = async () => {
    if (!id) {
      navigate("/404");
      return;
    }
    try {
      setIsLoading(true);
      const res = await planService.getPlanDetail(id);
      setInfoFieldsLeft([
        { label: "Crop", value: res?.cropName || "None", icon: Icons.growth },
        {
          label: "Growth Stage",
          value: planDetail?.growthStages.map((g) => g.name).join(",") || "None",
          icon: Icons.plant,
        },
      ]);
      setInfoFieldsRight([
        { label: "Process Name", value: res?.processName || "None", icon: Icons.process },
        { label: "Type", value: res?.masterTypeName || "None", icon: Icons.category, isTag: true },
      ]);
      console.log("res", res);

      setPlanDetail(res);
    } catch (error) {
      console.error("error", error);
      navigate("/error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProcessTree = async () => {
    try {
      const response = await planService.getProcessByPlanId(Number(id), Number(getFarmId()));
      console.log("tree", response);

      if (response.statusCode === 200) {
        setProcessTree(response.data);
        setProcessError(null);
      } else if (response.statusCode === 400) {
        setProcessTree(null);
        setProcessError("This is a non process plan");
      }
    } catch (error) {
      console.error("Failed to fetch process tree", error);
      setProcessTree(null);
      setProcessError("Failed to load process flow");
    }
  };

  useEffect(() => {
    fetchPlanDetail();
    fetchProcessTree();
  }, [id]);

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
              graftedPlantNames: graftedPlants.map((plant) => plant.graftedPlantName),
            });
          }
          break;

        case "Plant Lot":
          if (plantLots && plantLots.length > 0) {
            data.push({
              type: "Plant Lot",
              plotNames: landPlotName ? [landPlotName] : undefined,
              plantLotNames: plantLots.map((lot) => lot.plantLotName),
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

  const handleNodeClick = useCallback((node: PlanNodes | SubProcessNodes) => {
    if ("subProcessID" in node) {
      console.log("SubProcess clicked:", node);
    } else {
      console.log("Plan clicked:", node);
    }
  }, []);

  if (isLoading)
    return (
      <Flex justify="center" align="center" style={{ width: "100%" }}>
        <Loading />
      </Flex>
    );

  return (
    <div className={style.container}>
      <Flex className={style.extraContent}>
        <Tooltip title="Back to List">
          <Icons.back className={style.backIcon} onClick={() => navigate(PATHS.PLAN.PLAN_LIST)} />
        </Tooltip>
      </Flex>
      <Divider className={style.divider} />
      <Flex className={style.contentSectionTitleLeft}>
        <p className={style.title}>{planDetail?.planName}</p>
        <Tooltip title="Hello">
          <Icons.tag className={style.iconTag} />
        </Tooltip>
        <Tag className={`${style.statusTag} ${style.normal}`}>{planDetail?.status}</Tag>
      </Flex>
      <label className={style.subTitle}>Code: {planDetail?.planCode}</label>

      {/* Assigned Info */}
      <Flex vertical gap={10} className={style.contentSectionUser}>
        <Flex vertical={false} gap={15}>
          <Image src={Images.avatar} width={25} className={style.avt} />
          <label className={style.createdBy}>{planDetail?.assignorName}</label>
          <label className={style.textCreated}>created this plan</label>
          <label className={style.createdDate}>
            {planDetail?.startDate ? formatDateW(planDetail?.startDate) : ""}
          </label>
        </Flex>
        <Flex gap={15}>
          <label className={style.textUpdated}>Assigned To:</label>
          {planDetail?.listEmployee.map((employee, index) => (
            <div className={style.containerUser}>
              <Image
                src={employee?.avatarURL}
                crossOrigin="anonymous"
                width={27}
                height={27}
                className={style.avatar}
              />
              <span className={style.name}>{employee?.fullName}</span>
            </div>
          ))}
        </Flex>
        <Flex gap={15}>
          <label className={style.textUpdated}>Reporter:</label>
          {planDetail?.listReporter.map((report, index) => (
            <div className={style.containerUser}>
              <Image
                src={report?.avatarURL}
                crossOrigin="anonymous"
                width={27}
                height={27}
                className={style.avatar}
              />
              <span className={style.name}>{report?.fullName}</span>
            </div>
          ))}
        </Flex>
      </Flex>

      <Divider className={style.divider} />

      {/* Plan Progress */}
      <Flex className={style.progressContainer}>
        <label className={style.progressLabel}>Plan Progress:</label>
        <Progress percent={planDetail?.progress} status="active" strokeColor={"#20461e"} />
      </Flex>

      <Divider className={style.divider} />

      {/* Plan Details */}
      <div className={style.planDetailContainer}>
        <Flex className={style.infoSection}>
          <Flex className={style.col}>
            {infoFieldsLeft.map((field, index) => (
              <InfoField
                key={index}
                icon={field.icon}
                label={field.label}
                value={field.value}
                processId={planDetail?.processId}
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
                processId={planDetail?.processId}
              />
            ))}
          </Flex>
        </Flex>

        <Flex className={style.infoSection}>
          <div className={style.dateTime}>
            <div className={style.field}>
              <Icons.calendar />
              <span className={style.label}>Date:</span>
              <span className={style.value}>
                {planDetail?.startDate ? formatDate(planDetail?.startDate) : ""} -{" "}
                {planDetail?.endDate ? formatDate(planDetail?.endDate) : ""}
              </span>
            </div>

            <div className={style.field}>
              <Icons.calendar />
              <span className={style.label}>Time:</span>
              <span className={style.value}>
                {planDetail?.startTime} - {planDetail?.endTime}
              </span>
            </div>
          </div>

          <div className={style.details}>
            <div className={style.box}>
              <span className={style.label}>Plan Detail:</span>
              <p className={style.value}>{planDetail?.planDetail}</p>
            </div>

            <div className={style.box}>
              <span className={style.label}>Notes:</span>
              <p className={style.value}>{planDetail?.notes}</p>
            </div>
          </div>
        </Flex>
      </div>

      <Divider className={style.divider} />
      <section className="process-flow-section">
        <h2>Process Flow</h2>
        {processError ? (
          <div className="empty-process-flow">
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={processError} />
          </div>
        ) : processTree ? (
          <ProcessFlow
            data={processTree}
            currentPlanId={Number(id)}
            onNodeClick={handleNodeClick}
          />
        ) : (
          <Spin tip="Loading process flow..." />
        )}
      </section>
      <Divider className={style.divider} />
      <PlanTargetTable
        data={
          planDetail?.planTargetModels ? transformPlanTargetData(planDetail.planTargetModels) : []
        }
      />
      <Divider className={style.divider} />

      {/* Frequency Information */}
      <Flex>
        <Flex className={`${style.contentSectionBody} ${style.smallerSection}`}>
          <Flex className={style.col}>
            <div className={style.frequencyInfoFields}>
              <h3 className={style.smallTitle}>Frequency</h3>
              <Flex vertical gap={20}>
                <p>
                  <strong>Date:</strong>{" "}
                  {planDetail?.startDate ? formatDate(planDetail?.startDate) : ""} -{" "}
                  {planDetail?.endDate ? formatDate(planDetail?.endDate) : ""}
                </p>
                <p>
                  <strong>Time:</strong> {planDetail?.startTime} - {planDetail?.endTime}
                </p>
                <p>
                  <strong>Type:</strong>{" "}
                  <span className={style.valueType}>{planDetail?.frequency}</span>
                </p>
              </Flex>

              {planDetail?.frequency === "None" && (
                <ul className={style.dateList}>
                  {JSON.parse(planDetail?.customDates || "[]").map((day: string, index: number) => (
                    <li key={index}>{day}</li>
                  ))}
                </ul>
              )}

              {planDetail?.frequency === "Weekly" && (
                <Flex className={style.weekDays}>
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                    <span
                      key={index}
                      className={`${style.weekDay} ${
                        planDetail.dayOfWeek.includes(index) ? style.active : ""
                      }`}
                    >
                      {day}
                    </span>
                  ))}
                </Flex>
              )}

              {planDetail?.frequency === "Monthly" && (
                <div className={style.monthGrid}>
                  {[...Array(31)].map((_, index) => {
                    const day = index + 1;
                    return (
                      <span
                        key={day}
                        className={`${style.monthDay} ${
                          JSON.parse(planDetail.dayOfMonth).includes(day) ? style.active : ""
                        }`}
                      >
                        {day}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </Flex>
        </Flex>

        {/* Work Log */}
        <Flex className={style.workLogContainer} gap={15}>
          <h3>
            Work Log From Plan{" "}
            <span>
              {numOfCompleted}/{total}
            </span>
          </h3>
          {planDetail?.listWorkLog.map((log) => (
            <Card key={log.workLogID} className={style.workLogCard}>
              <Flex align="center" justify="space-between">
                <Flex align="center" gap={8}>
                  <span className={style.taskDot} />
                  <h4>{log.workLogName}</h4>
                </Flex>
                <StatusTag status={log.status} />
              </Flex>
              <Flex align="center" justify="space-between" className={style.underSection}>
                <p className={style.workLogDate}>{formatDateW(log.dateWork)}</p>
                <Link to={`/hr-management/worklogs/${log.workLogID}`} className={style.link}>
                  View Details
                </Link>
              </Flex>
            </Card>
          ))}
        </Flex>
      </Flex>
    </div>
  );
}

export default PlanDetail;
