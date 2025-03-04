import { Flex, Popover } from "antd";
import { Searchbar, CustomButton } from "@/components";
import { Icons } from "@/assets";
import style from "./TableTitle.module.scss";

type TableTitleProps = {
  onSearch: (value: string) => void;
  filterContent?: JSX.Element;
  filterLabel?: string;
  addLabel?: string;
  importLabel?: string;
  onAdd: () => void;
  onImport?: () => void;
  noAdd?: boolean;
  noFilter?: boolean;
  noImport?: boolean;
  extraContent?: React.ReactNode;
};

const TableTitle = ({
  onSearch,
  filterContent,
  filterLabel = "Filter",
  addLabel = "Add New",
  importLabel = "Import",
  onAdd,
  onImport,
  noAdd = false,
  noFilter = false,
  noImport = true,
  extraContent,
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
      {extraContent && <Flex className={style.extraContent}>{extraContent}</Flex>}
      <Flex className={style.sectionRight}>
        {!noImport && (
          <CustomButton label={importLabel} icon={<Icons.upload />} handleOnClick={onImport} />
        )}
        {!noAdd && <CustomButton label={addLabel} icon={<Icons.plus />} handleOnClick={onAdd} />}
      </Flex>
    </Flex>
  );
};
export default TableTitle;
