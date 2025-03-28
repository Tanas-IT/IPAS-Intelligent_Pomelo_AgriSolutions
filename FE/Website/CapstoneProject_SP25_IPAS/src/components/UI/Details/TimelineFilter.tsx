import { DatePicker, Flex, Typography } from "antd";
import { Icons } from "@/assets";
import style from "./Details.module.scss";
import { DATE_FORMAT } from "@/utils";
import { Dayjs } from "dayjs";

const { Text } = Typography;
const { RangePicker } = DatePicker;

interface TimelineFilterProps {
  dateRange: [Dayjs, Dayjs] | null;
  onDateChange: (dates: [Dayjs | null, Dayjs | null] | null) => void;
}

const TimelineFilter: React.FC<TimelineFilterProps> = ({ dateRange, onDateChange }) => {
  return (
    <Flex gap={20} className={style.filterSection}>
      <Flex justify="center" align="center" gap={4}>
        <Icons.calendar className={style.icon} />
        <Text strong>Timeline:</Text>
      </Flex>
      <RangePicker format={DATE_FORMAT} value={dateRange} onChange={onDateChange} allowClear />
    </Flex>
  );
};

export default TimelineFilter;
