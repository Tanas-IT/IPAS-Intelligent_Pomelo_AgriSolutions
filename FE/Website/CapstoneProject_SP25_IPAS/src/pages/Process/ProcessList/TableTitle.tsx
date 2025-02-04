import { Flex, Form, Input, Modal, Popover, Select } from "antd";
import { Searchbar, CustomButton, TagRender } from "@/components";
import { Icons } from "@/assets";
import style from "./ProcessList.module.scss";
import { useState } from "react";
import ProcessModal from "./AddProcessModal";

type TableTitleProps = {
  onSearch: (value: string) => void;
  filterContent: JSX.Element;
};

export const TableTitle = ({ onSearch, filterContent }: TableTitleProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => setIsModalOpen(true);
  const handleClose = () => setIsModalOpen(false);

  const handleSave = (newProcess: any) => {
    console.log("New Process Data:", newProcess);
    setIsModalOpen(false);
  };

  const growthStageOptions = [
    { value: "gold" },
    { value: "lime" },
    { value: "green" },
    { value: "cyan" },
    { value: "ds" },
    { value: "as" },
  ];

  const processTypeOptions = [
    { value: "type 1" },
    { value: "type 2" },
    { value: "type 3" },
    { value: "type 4" }
  ];
  return (
    <Flex className={style.headerWrapper}>
      <Flex className={style.sectionLeft}>
        <Searchbar onSearch={onSearch} />
        <Popover zIndex={999} content={filterContent} trigger="click" placement="bottomRight">
          <>
            <CustomButton label="Filter" icon={<Icons.filter />} handleOnClick={() => { }} />
          </>
        </Popover>
      </Flex>
      <Flex className={style.sectionRight}>
        <CustomButton label="Add New Process" icon={<Icons.plus />} handleOnClick={showModal} />
      </Flex>
      <ProcessModal isOpen={isModalOpen} onClose={handleClose} onSave={handleSave} />
    </Flex>
  );
};
