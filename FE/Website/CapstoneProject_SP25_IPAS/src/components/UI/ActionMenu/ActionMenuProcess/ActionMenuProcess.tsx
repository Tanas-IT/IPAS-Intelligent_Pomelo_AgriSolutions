import { FC } from "react";
import { Icons } from "@/assets";
import ActionMenu from "../ActionMenu/ActionMenu";
import { useNavigate } from "react-router-dom";

interface ActionMenuProps {
  id: number;
  //   onEdit: (id: number, user: userUpdate) => void;
  //   onDelete: (id: number) => void;
}

const ActionMenuProcess: FC<ActionMenuProps> = ({ id }) => {
  const navigate = useNavigate();
  const handleEditClick = async () => {
    console.log("Edit Clicked");
    
  };

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
      icon: <Icons.edit />,
      label: "Update Process",
      onClick: handleEditClick,
    },
    {
      icon: <Icons.delete />,
      label: "Delete Process",
      onClick: () => {},
    },
  ];

  return (
    <>
      <ActionMenu title="Process Manage" items={actionItems} />
    </>
  );
};

export default ActionMenuProcess;
