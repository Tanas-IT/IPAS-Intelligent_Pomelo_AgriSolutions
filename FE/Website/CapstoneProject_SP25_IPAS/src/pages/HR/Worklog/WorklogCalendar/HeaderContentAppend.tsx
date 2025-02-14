import { Icons } from "@/assets";
import { CustomButton } from "@/components";
import { Button, Flex, Popover } from "antd"
import WorklogFilter from "./WorklogFilter/WorklogFilter";

interface HeaderContentAppendProps {
    addModal: {
        showModal: () => void;
        hideModal: () => void;
        modalState: { visible: boolean };
    };
    filterContent: JSX.Element;
}

const HeaderContentAppend: React.FC<HeaderContentAppendProps> = ({ filterContent, addModal }) => {

    return (
        <Flex gap={10}>
            <Popover zIndex={999} content={filterContent} trigger="click" placement="bottomRight">
                <>
                    <CustomButton label="Filter" icon={<Icons.filter />} handleOnClick={() => { }} />
                </>
            </Popover>
            <CustomButton
                label="Add New Task"
                icon={<Icons.plus />}
                handleOnClick={() => addModal.showModal()}
            />
        </Flex>
    )
}

export default HeaderContentAppend;