import { Form, TimePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";
import style from "./TimePicker.module.scss";

interface TimePickerProps {
    label: string;
    name: string;
    rules?: any[];
    isEditing?: boolean;
    onChange?: (value: Dayjs) => void;
}

const TimePickerInfo: React.FC<TimePickerProps> = ({
    label,
    name,
    rules = [],
    onChange,
    isEditing = true,
}) => {
    return (
        <Form.Item
            className={style.formWrapper}
            label={label}
            name={name}
            rules={rules}>
            <TimePicker.RangePicker
                // onChange={onChange}
                defaultOpenValue={dayjs('00:00:00', 'HH:mm:ss')}
                disabled={!isEditing}
                className={style.timePicker}
            />
        </Form.Item>
    );
}

export default TimePickerInfo;