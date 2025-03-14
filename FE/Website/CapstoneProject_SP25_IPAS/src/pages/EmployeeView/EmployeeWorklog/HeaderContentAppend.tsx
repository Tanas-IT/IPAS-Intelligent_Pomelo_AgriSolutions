import { Icons } from "@/assets";
import { CustomButton } from "@/components";
import { Button, Flex, Popover } from "antd"

interface HeaderContentAppendProps {
    filterContent: JSX.Element;
}

const HeaderContentAppend: React.FC<HeaderContentAppendProps> = ({ filterContent }) => {

    return (
        <Flex gap={10}>
            <Popover zIndex={999} content={filterContent} trigger="click" placement="bottomRight">
                <>
                    <CustomButton label="Filter" icon={<Icons.filter />} handleOnClick={() => { }} />
                </>
            </Popover>
        </Flex>
    )
}

export default HeaderContentAppend;