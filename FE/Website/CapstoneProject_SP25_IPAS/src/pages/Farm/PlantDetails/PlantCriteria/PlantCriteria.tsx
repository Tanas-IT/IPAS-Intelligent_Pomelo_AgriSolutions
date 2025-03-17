import style from "./PlantCriteria.module.scss";
import { Checkbox, Collapse, Divider, Empty, Flex, Table } from "antd";
import { ConfirmModal, CriteriaCheckTable, LoadingSkeleton } from "@/components";
import { useEffect, useState } from "react";
import { useDirtyStore, usePlantLotStore } from "@/stores";
import { useModal, useStyle } from "@/hooks";
import { criteriaService, plantLotService } from "@/services";
import {
  CriteriaApplyRequest,
  CriteriaCheckData,
  CriteriaCheckRequest,
  CriteriaDeleteRequest,
  GetCriteriaObject,
} from "@/payloads";
import ApplyCriteriaModal from "../../PlantLot/ApplyCriteriaModal";
import { toast } from "react-toastify";
import { CRITERIA_TARGETS } from "@/constants";
import PlantSectionHeader from "../PlantSectionHeader/PlantSectionHeader";
import { PlantPanelTitle } from "./PlantPanelTitle";

function PlantCriteria() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // const [criteriaGroups, setCriteriaGroups] = useState<
  //   { title: string; key: string; criteriaData: any[] }[]
  // >([]);

  if (isLoading) return <LoadingSkeleton rows={10} />;
  const handlePassChange = () => {};
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
      title: "Pass",
      key: "isPass",
      align: "center" as const,
      render: (_: any, record: { key: number; isPass: boolean; isNotPass: boolean }) => (
        <Checkbox checked={record.isPass} onChange={(e) => handlePassChange()} />
      ),
    },
    {
      title: "Not Pass",
      key: "isNotPass",
      align: "center" as const,
      render: (_: any, record: { key: number; isPass: boolean; isNotPass: boolean }) => (
        <Checkbox checked={record.isNotPass} onChange={(e) => handlePassChange()} />
      ),
    },
  ];

  const criteriaGroups: GetCriteriaObject[] = [
    {
      masterTypeId: 1,
      masterTypeName: "Tree Growth Criteria",
      target: "Tree",
      criteriaList: Array.from({ length: 3 }, (_, index) => ({
        criteriaId: index + 1,
        criteriaName: "Tree Height >= 2m",
        description:
          "Ensures tree height is at least 2 meters (Measured from base to highest point)",
        createDate: new Date(),
        priority: index + 1,
        isChecked: false,
        isPassed: false,
      })),
    },
    {
      masterTypeId: 2,
      masterTypeName: "Soil Quality Criteria",
      target: "Soil",
      criteriaList: Array.from({ length: 2 }, (_, index) => ({
        criteriaId: index + 4, // Đảm bảo id là duy nhất
        criteriaName: "Soil pH 6.0 - 7.5",
        description: "Ensures soil acidity is in the optimal range",
        createDate: new Date(),
        priority: index + 1,
        isChecked: false,
        isPassed: false,
      })),
    },
  ];

  // const renderPanelTitle = (title: string, data: any[]) => {
  //   const completedCount = data.filter((item) => item.isCompleted).length;
  //   return (
  //     <span className={style.panelTitle}>
  //       {title}
  //       <span className={style.completedCount}>
  //         ({completedCount}/{data.length})
  //       </span>
  //     </span>
  //   );
  // };

  return (
    <Flex className={style.contentDetailWrapper}>
      <PlantSectionHeader isCriteria={true} />
      <Divider className={style.divider} />
      <Flex className={style.contentSectionBody}>
        <Collapse className={style.criteriaCollapse} defaultActiveKey={[]} ghost>
          {criteriaGroups.map((group) => (
            <Collapse.Panel
              header={
                <PlantPanelTitle
                  title={group.masterTypeName}
                  target={group.target}
                  criteriaSetId={group.masterTypeId}
                  data={group.criteriaList}
                  handleDelete={() => {}}
                />
              }
              key={group.masterTypeId}
            >
              <CriteriaCheckTable
                data={group.criteriaList}
                hasPassCheck
                isConditionCompleted={false}
                handleCompletedChange={() => {}}
              />
            </Collapse.Panel>
          ))}
        </Collapse>
      </Flex>
    </Flex>
  );
}

export default PlantCriteria;
