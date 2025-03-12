import style from "./PlantLotCriteria.module.scss";
import { Checkbox, Collapse, Divider, Flex, Table } from "antd";
import { LoadingSkeleton } from "@/components";
import { useEffect, useState } from "react";
import { usePlantLotStore } from "@/stores";
import LotSectionHeader from "../LotSectionHeader/LotSectionHeader";

function PlantLotCriteria() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { lot } = usePlantLotStore();

  //   const fetchPlantLot = async () => {
  //     setIsLoading(true);
  //     await new Promise((resolve) => setTimeout(resolve, 1000)); // ⏳ Delay 1 giây
  //     try {
  //       const res = await plantLotService.getPlantLot(Number(lotId));
  //       if (res.statusCode === 200) {
  //         setLot(res.data);
  //       }
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   useEffect(() => {
  //     fetchPlantLot();
  //   }, []);

  if (isLoading) return <LoadingSkeleton rows={10} />;
  const handleCompletedChange = (key: number, checked: boolean) => {};

  const criteriaColumns = (groupKey: string) => [
    {
      title: "#",
      dataIndex: "index",
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
      key: "isCompleted",
      align: "center" as const,
      render: (_: any, record: { key: number; isCompleted: boolean }) => (
        <Checkbox
          checked={record.isCompleted}
          onChange={(e) => handleCompletedChange(record.key, e.target.checked)}
        />
      ),
    },
  ];

  const criteriaGroups = [
    {
      title: "Tree Growth Criteria",
      key: "group1",
      criteriaData: Array.from({ length: 3 }, (_, index) => ({
        key: index + 1,
        criteriaName: "Tree Height >= 2m",
        criteriaDescription:
          "Ensures tree height is at least 2 meters (Measured from base to highest point)",
        priority: index + 1,
        isCompleted: false,
      })),
    },
    {
      title: "Soil Quality Criteria",
      key: "group2",
      criteriaData: Array.from({ length: 2 }, (_, index) => ({
        key: index + 1,
        criteriaName: "Soil pH 6.0 - 7.5",
        criteriaDescription: "Ensures soil acidity is in the optimal range",
        priority: index + 1,
        isCompleted: false,
      })),
    },
  ];

  const renderPanelTitle = (title: string, data: any[]) => {
    const completedCount = data.filter((item) => item.isCompleted).length;
    return (
      <span className={style.panelTitle}>
        {title}
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
        {/* <h1>ds</h1> */}
        <Collapse className={style.criteriaCollapse} defaultActiveKey={[]} ghost>
          {criteriaGroups.map((group) => (
            <Collapse.Panel
              header={renderPanelTitle(group.title, group.criteriaData)}
              key={group.key}
            >
              <div className={style.criteriaTableWrapper}>
                <Table
                  columns={criteriaColumns(group.key)}
                  dataSource={group.criteriaData}
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
