import { Input } from "antd";

interface EditableTreeNodeProps {
  isEditing: boolean;
  title: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}

const EditableTreeNode: React.FC<EditableTreeNodeProps> = ({
  isEditing,
  title,
  onChange,
  onBlur,
}) => {
  return isEditing ? (
    <Input style={{width: "90%"}} value={title} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} autoFocus />
  ) : (
    title
  );
};

export default EditableTreeNode;
