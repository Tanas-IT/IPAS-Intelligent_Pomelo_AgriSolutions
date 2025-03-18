import { Flex, Popover } from "antd";
import { Searchbar, CustomButton } from "@/components";
import { Icons } from "@/assets";
import style from "./PlanList.module.scss";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

type TableTitleProps = {
  onSearch: (value: string) => void;
  filterContent: JSX.Element;
};

export const TableTitle = ({ onSearch, filterContent }: TableTitleProps) => {
  const navigate = useNavigate();
  
  
  const handleClickAddPlan = () => {
    navigate("/plans/add");
  }

  const handleClickAddPlanByProcess = () => {
    navigate("/plans/add-plan-by-process");
  }

  
  return (
    <Flex className={style.headerWrapper}>
      <Flex className={style.sectionLeft}>
        <Searchbar onSearch={onSearch} />
        <Popover zIndex={999} content={filterContent} trigger="click" placement="bottomRight">
          <>
            <CustomButton label="Filter" icon={<Icons.filter />} handleOnClick={() => {}} />
          </>
        </Popover>
      </Flex>
      <Flex className={style.sectionRight} gap={15}>
        <CustomButton label="Add Plan By Process" icon={<Icons.plus />} handleOnClick={handleClickAddPlanByProcess} />
        <CustomButton label="Add New Plan" icon={<Icons.plus />} handleOnClick={handleClickAddPlan} />
      </Flex>
    </Flex>
  );
};
