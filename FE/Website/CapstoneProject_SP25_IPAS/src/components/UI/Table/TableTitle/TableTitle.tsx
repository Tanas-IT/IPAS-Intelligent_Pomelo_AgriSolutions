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
  onAdd?: () => void;
  onImport?: () => void;
  onExport?: () => void;
  noAdd?: boolean;
  noFilter?: boolean;
  noImport?: boolean;
  isEdit?: boolean;
  extraContent?: React.ReactNode;
  sectionRightSize?: "full" | "small";
};

const TableTitle = ({
  onSearch,
  filterContent,
  filterLabel = "Filter",
  addLabel = "Add New",
  importLabel = "Import",
  onAdd,
  onImport,
  onExport,
  noAdd = false,
  noFilter = false,
  noImport = true,
  isEdit = false,
  extraContent,
  sectionRightSize = "full",
}: TableTitleProps) => {
  return (
    <Flex className={style.headerWrapper}>
      <Flex className={style.sectionLeft}>
        <Searchbar onSearch={onSearch} />
        {!noFilter && (
          <Popover
            zIndex={9}
            content={filterContent}
            trigger="click"
            placement="bottomRight"
            overlayInnerStyle={{
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
              borderRadius: "8px",
            }}
          >
            <>
              <CustomButton label={filterLabel} icon={<Icons.filter />} />
            </>
          </Popover>
        )}
        {/* {extraContent && <Flex className={style.extraContent}>{extraContent}</Flex>} */}
        {extraContent && <> {extraContent}</>}
      </Flex>
      <Flex className={`${style.sectionRight} ${style[sectionRightSize]}`} gap={20}>
        {onExport && (
          <CustomButton label="Export" icon={<Icons.download />} handleOnClick={onExport} />
        )}
        {!noImport && (
          <CustomButton label={importLabel} icon={<Icons.upload />} handleOnClick={onImport} />
        )}
        {!noAdd ? (
          <CustomButton
            label={addLabel}
            icon={isEdit ? <Icons.edit /> : <Icons.plus />}
            handleOnClick={onAdd}
          />
        ) : (
          <div style={{ width: "1px", visibility: "hidden" }} />
        )}
      </Flex>
    </Flex>
  );
};
export default TableTitle;
