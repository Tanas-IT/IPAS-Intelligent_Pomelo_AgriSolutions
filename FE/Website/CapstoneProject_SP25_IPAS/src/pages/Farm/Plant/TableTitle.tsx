import { Flex, Popover } from "antd";
import { Searchbar, CustomButton } from "@/components";
import { Icons } from "@/assets";
import style from "./PlantList.module.scss";

type TableTitleProps = {
  onSearch: (value: string) => void;
  filterContent: JSX.Element;
};

export const TableTitle = ({ onSearch, filterContent }: TableTitleProps) => {
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
        <CustomButton label="Add New Plant" icon={<Icons.plus />} handleOnClick={() => { }} />
      </Flex>
    </Flex>
  );
};
