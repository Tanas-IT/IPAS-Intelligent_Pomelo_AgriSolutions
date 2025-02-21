import { Flex, Form, Input, Modal, Popover, Select } from "antd";
import { Searchbar, CustomButton, TagRender } from "@/components";
import { Icons } from "@/assets";
import style from "./ProcessList.module.scss";
type TableTitleProps = {
  onSearch: (value: string) => void;
  filterContent?: JSX.Element;
  filterLabel?: string;
  addLabel?: string;
  onAdd: () => void;
};

const TableTitle = ({
  onSearch,
  filterContent,
  filterLabel = "Filter",
  addLabel = "Add New",
  onAdd,
}: TableTitleProps) => {
  return (
    <Flex className={style.headerWrapper}>
      <Flex className={style.sectionLeft}>
        <Searchbar onSearch={onSearch} />
        <Popover zIndex={999} content={filterContent} trigger="click" placement="bottomRight">
          <>
            <CustomButton label={filterLabel} icon={<Icons.filter />} />
          </>
        </Popover>
      </Flex>
      <Flex className={style.sectionRight}>
        <CustomButton label={addLabel} icon={<Icons.plus />} handleOnClick={onAdd} />
      </Flex>
    </Flex>
  );
};
export default TableTitle;