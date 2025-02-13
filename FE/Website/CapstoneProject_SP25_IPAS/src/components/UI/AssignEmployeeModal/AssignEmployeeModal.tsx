import { ModalForm } from "@/components";
import { Form } from "antd";
type WorklogModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (values: CreateWorklogRequest) => void;
};

const AssignEmployeeModal = ({ isOpen, onClose, onSave }: WorklogModalProps) => {
    return (
        <ModalForm
            isOpen={isOpen}
            onClose={onClose}
        >
        </ModalForm>
    )
}