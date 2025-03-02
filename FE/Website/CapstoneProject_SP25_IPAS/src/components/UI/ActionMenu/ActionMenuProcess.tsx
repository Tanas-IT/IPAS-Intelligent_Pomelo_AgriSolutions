import { FC } from "react";
import { Icons } from "@/assets";
import ActionMenu from "./ActionMenu/ActionMenu";
import { useNavigate } from "react-router-dom";

interface ActionMenuProps {
  id: number;
  //   onEdit: (id: number, user: userUpdate) => void;
    onDelete: (id: number) => void;
}

const ActionMenuProcess: FC<ActionMenuProps> = ({ id, onDelete }) => {
  const navigate = useNavigate();

  const handleDetailClick = async () => {
    console.log("Detail Clicked");
    navigate(`/processes/${id}`);
  };
  const actionItems = [
    {
      icon: <Icons.detail />,
      label: "View Details",
      onClick: handleDetailClick,
    },
    {
      icon: <Icons.delete />,
      label: "Delete Process",
      onClick: () => onDelete(id),
    },
  ];

  return (
    <>
      <ActionMenu title="Process Manage" items={actionItems} />
    </>
  );
};

export default ActionMenuProcess;
