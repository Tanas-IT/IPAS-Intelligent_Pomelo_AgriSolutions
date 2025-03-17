import { Icons } from "@/assets";
import { CustomButton } from "@/components";
import { Button, Flex, Popover } from "antd";
import WorklogFilter from "./WorklogFilter/WorklogFilter";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes";

interface HeaderContentAppendProps {
  addModal: {
    showModal: () => void;
    hideModal: () => void;
    modalState: { visible: boolean };
  };
  filterContent: JSX.Element;
}

const HeaderContentAppend: React.FC<HeaderContentAppendProps> = ({ filterContent, addModal }) => {
    const navigate = useNavigate();

    return (
        <Flex gap={10}>
            <Popover zIndex={999} content={filterContent} trigger="click" placement="bottomRight">
                <>
                    <CustomButton label="Filter" icon={<Icons.filter />} handleOnClick={() => { }} />
                </>
            </Popover>
            <CustomButton
                label="Add New Plan"
                icon={<Icons.plus />}
                // handleOnClick={() => addModal.showModal()}
                handleOnClick={() => navigate(PATHS.PLAN.ADD_PLAN)}
            />
        </Flex>
    )
}

export default HeaderContentAppend;
