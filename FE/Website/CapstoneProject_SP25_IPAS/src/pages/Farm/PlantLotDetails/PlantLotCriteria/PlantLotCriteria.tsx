import style from "./PlantLotCriteria.module.scss";
import { Checkbox, Collapse, Divider, Flex, Table } from "antd";
import { LoadingSkeleton } from "@/components";
import { useEffect, useState } from "react";
import { usePlantLotStore } from "@/stores";
import LotSectionHeader from "../LotSectionHeader/LotSectionHeader";
import { useStyle } from "@/hooks";
import { criteriaService } from "@/services";
import { GetCriteriaCheck, GetCriteriaObject } from "@/payloads";

function PlantLotCriteria() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [criteriaGroups, setCriteriaGroups] = useState<GetCriteriaObject[]>([]);
  const { lot } = usePlantLotStore();
  const { styles } = useStyle();

  const fetchCriteriaPlantLot = async () => {
    setIsLoading(true);
    if (!lot) return;
    await new Promise((resolve) => setTimeout(resolve, 1000)); // ⏳ Delay 1 giây
    try {
      const res = await criteriaService.getCriteriaOfLandPlot(Number(lot.plantLotId));
      if (res.statusCode === 200) setCriteriaGroups(res.data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCriteriaPlantLot();
  }, []);

  if (isLoading) return <LoadingSkeleton rows={10} />;
  const handleCompletedChange = (criteriaId: number, checked: boolean) => {
    setCriteriaGroups((prevGroups) =>
      prevGroups.map((group) => ({
        ...group,
        criteriaData: group.criteriaList.map((item) =>
          item.criteriaId === criteriaId ? { ...item, isChecked: checked } : item,
        ),
      })),
    );
  };
  const criteriaColumns = (groupKey: number) => [
    {
      title: "#",
      key: "index",
      align: "center" as const,
      render: (_: any, __: any, rowIndex: number) => rowIndex + 1,
    },
    {
      title: "Name",
      dataIndex: "criteriaName",
      key: "criteriaName",
      align: "center" as const,
    },
    {
      title: "Description",
      dataIndex: "criteriaDescription",
      key: "criteriaDescription",
      align: "center" as const,
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      align: "center" as const,
    },
    {
      title: "Is Completed",
      key: "isChecked",
      align: "center" as const,
      render: (_: any, record: GetCriteriaCheck) => (
        <Checkbox
          className={styles.customCheckbox}
          checked={record.isChecked}
          onChange={(e) => handleCompletedChange(record.criteriaId, e.target.checked)}
        />
      ),
    },
  ];

  // const criteriaGroups = [
  //   {
  //     title: "Tree Growth Criteria",
  //     // key: "group1",
  //     criteriaData: Array.from({ length: 3 }, (_, index) => ({
  //       key: index + 1,
  //       criteriaName: "Tree Height >= 2m",
  //       criteriaDescription:
  //         "Ensures tree height is at least 2 meters (Measured from base to highest point)",
  //       priority: index + 1,
  //       isCompleted: false,
  //       isPass: false,
  //       isNotPass: false,
  //     })),
  //   },
  //   {
  //     title: "Soil Quality Criteria",
  //     // key: "group2",
  //     criteriaData: Array.from({ length: 2 }, (_, index) => ({
  //       key: index + 1,
  //       criteriaName: "Soil pH 6.0 - 7.5",
  //       criteriaDescription: "Ensures soil acidity is in the optimal range",
  //       priority: index + 1,
  //       isCompleted: false,
  //       isPass: false,
  //       isNotPass: false,
  //     })),
  //   },
  // ];

  const renderPanelTitle = (title: string, target: string, data: GetCriteriaCheck[]) => {
    const completedCount = data.filter((item) => item.isChecked).length;
    return (
      <span className={style.panelTitle}>
        {title} - <span className={style.targetText}>{target}</span>
        <span className={style.completedCount}>
          ({completedCount}/{data.length})
        </span>
      </span>
    );
  };

  return (
    <Flex className={style.contentDetailWrapper}>
      <LotSectionHeader lot={lot} isCriteria={true} />
      <Divider className={style.divider} />
      <Flex className={style.contentSectionBody}>
        <Collapse className={style.criteriaCollapse} defaultActiveKey={[]} ghost>
          {criteriaGroups.map((group) => (
            <Collapse.Panel
              header={renderPanelTitle(group.masterTypeName, group.target, group.criteriaList)}
              key={group.masterTypeId}
            >
              <div className={style.criteriaTableWrapper}>
                <Table
                  columns={criteriaColumns(group.masterTypeId)}
                  dataSource={group.criteriaList}
                  pagination={false}
                  bordered
                  className={style.criteriaTable}
                />
              </div>
            </Collapse.Panel>
          ))}
        </Collapse>
      </Flex>
    </Flex>
  );
}

export default PlantLotCriteria;
