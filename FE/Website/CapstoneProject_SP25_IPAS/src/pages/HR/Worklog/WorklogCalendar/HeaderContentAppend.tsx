import { Icons } from "@/assets";
import { CustomButton } from "@/components";
import { Flex, Popover } from "antd";

interface HeaderContentAppendProps {
  addModal: {
    showModal: () => void;
    hideModal: () => void;
    modalState: { visible: boolean };
  };
  filterContent: JSX.Element;
}

const statusLegend = [
  { status: "Not Started", color: "#880E4F", background: "#E1BEE7" },
  { status: "In Progress", color: "#0D47A1", background: "#BBDEFB" },
  { status: "Overdue", color: "#B71C1C", background: "#FFCDD2" },
  { status: "Reviewing", color: "#FF6F00", background: "#FFECB3" },
  { status: "Done", color: "#1B5E20", background: "#C8E6C9" },
];

const HeaderContentAppend: React.FC<HeaderContentAppendProps> = ({ filterContent, addModal }) => {
  const legendContent = (
    <Flex gap="small" vertical>
      {statusLegend.map((item) => (
        <Flex key={item.status} align="center" gap="small">
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: item.background,
            }}
          />
          <p>{item.status}</p>
        </Flex>
      ))}
    </Flex>
  );

  return (
    <Flex gap={10}>
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
          <CustomButton label="Filter" icon={<Icons.filter />} />
        </>
      </Popover>
      <Popover
        zIndex={9}
        content={legendContent}
        trigger="click"
        placement="bottomRight"
        overlayInnerStyle={{
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
          borderRadius: "8px",
        }}
      >
        <>
          <CustomButton label="Show Legend" icon={<Icons.info />} />
        </>
      </Popover>
      <CustomButton
        label="Add New Worklog"
        icon={<Icons.plus />}
        handleOnClick={() => addModal.showModal()}
        // handleOnClick={() => navigate(PATHS.PLAN.ADD_PLAN)}
      />
    </Flex>
  );
};

export default HeaderContentAppend;
