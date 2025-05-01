import { FC } from "react";
import { Icons } from "@/assets";
import ActionMenu from "./ActionMenu/ActionMenu";
import { ActionMenuItem } from "@/types";

interface ActionMenuProps {
  isCropComplete: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onOpenRecordModal: () => void;
  onImport: () => void;
}

const ActionMenuHarvest: FC<ActionMenuProps> = ({
  isCropComplete,
  onEdit,
  onDelete,
  onOpenRecordModal,
  onImport,
}) => {
  const actionItems = [
    {
      icon: <Icons.edit />,
      label: "Update Harvest",
      onClick: () => onEdit(),
    },
    {
      icon: <Icons.delete />,
      label: "Delete Harvest",
      onClick: () => onDelete(),
    },
    !isCropComplete
      ? {
          icon: <Icons.fileAdd />,
          label: "Record Harvest",
          onClick: () => onOpenRecordModal(),
        }
      : null,
    !isCropComplete
      ? {
          icon: <Icons.upload />,
          label: "Import Harvest",
          onClick: onImport,
        }
      : null,
  ].filter(Boolean) as ActionMenuItem[];

  return (
    <>
      <ActionMenu title="Harvest Manage" items={actionItems} />
    </>
  );
};

export default ActionMenuHarvest;
