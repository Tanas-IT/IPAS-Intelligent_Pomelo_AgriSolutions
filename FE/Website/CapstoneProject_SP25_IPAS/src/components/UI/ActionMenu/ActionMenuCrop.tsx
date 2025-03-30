import { FC } from "react";
import { Icons } from "@/assets";
import ActionMenu from "./ActionMenu/ActionMenu";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants";
import { ActionMenuItem } from "@/types";

interface ActionMenuProps {
  id?: number;
  onEdit: () => void;
  onDelete: () => void;
}

const ActionMenuCrop: FC<ActionMenuProps> = ({ id, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const actionItems = [
    id !== undefined
      ? {
          icon: <Icons.eye />,
          label: "View  Crop Details",
          onClick: () => navigate(ROUTES.CROP_DETAIL(id)),
        }
      : null,
    {
      icon: <Icons.edit />,
      label: "Update Crop",
      onClick: () => onEdit(),
    },
    {
      icon: <Icons.delete />,
      label: "Delete Crop",
      onClick: () => onDelete(),
    },
  ].filter(Boolean) as ActionMenuItem[];

  return (
    <>
      <ActionMenu title="Crop Manage" items={actionItems} />
    </>
  );
};

export default ActionMenuCrop;
