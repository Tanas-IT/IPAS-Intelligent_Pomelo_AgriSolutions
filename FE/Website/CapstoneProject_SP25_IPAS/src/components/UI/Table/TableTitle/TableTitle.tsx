import { Flex, Popover } from "antd";
import { Searchbar, CustomButton } from "@/components";
import { Icons } from "@/assets";
import style from "./TableTitle.module.scss";

type TableTitleProps = {
  onSearch: (value: string) => void;
  filterContent?: JSX.Element;
  filterLabel?: string;
  addLabel?: string;
  onAdd: () => void;
  noFilter?: boolean;
};

const TableTitle = ({
  onSearch,
  filterContent,
  filterLabel = "Filter",
  addLabel = "Add New",
  onAdd,
  noFilter = false,
}: TableTitleProps) => {
  return (
    <Flex className={style.headerWrapper}>
      <Flex className={style.sectionLeft}>
        <Searchbar onSearch={onSearch} />
        {!noFilter && (
          <Popover zIndex={999} content={filterContent} trigger="click" placement="bottomRight">
            <>
              <CustomButton label={filterLabel} icon={<Icons.filter />} />
            </>
          </Popover>
        )}
      </Flex>
      <Flex className={style.sectionRight}>
        <CustomButton label={addLabel} icon={<Icons.plus />} handleOnClick={onAdd} />
      </Flex>
    </Flex>
  );
};
export default TableTitle;
