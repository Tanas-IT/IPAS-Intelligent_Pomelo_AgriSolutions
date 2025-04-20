import { FC } from "react";
import { Icons } from "@/assets";
import ActionMenu from "./ActionMenu/ActionMenu";
import { ActionMenuItem } from "@/types";
import { GetFarmInfo } from "@/payloads";

interface ActionMenuProps {
  farm: GetFarmInfo;
  onEdit: () => void;
  onDeactivate: (ids: number[]) => void;
  onActivate: (ids: number[]) => void;
  onDelete: () => void;
}

const ActionMenuFarm: FC<ActionMenuProps> = ({
  farm,
  onEdit,
  onDeactivate,
  onActivate,
  onDelete,
}) => {
  const isActive = farm.status === "Active";

  const actionItems: ActionMenuItem[] = [
    {
      icon: <Icons.edit />,
      label: "Update Farm",
      onClick: onEdit,
    },
    {
      icon: isActive ? <Icons.ban /> : <Icons.checkSuccuss />,
      label: isActive ? "Deactivate Farm" : "Activate Farm",
      onClick: () => {
        isActive ? onDeactivate([farm.farmId]) : onActivate([farm.farmId]);
      },
    },
    {
      icon: <Icons.delete />,
      label: "Delete Farm",
      onClick: onDelete,
    },
  ];

  return <ActionMenu title="Farm Manage" items={actionItems} />;
};

export default ActionMenuFarm;
