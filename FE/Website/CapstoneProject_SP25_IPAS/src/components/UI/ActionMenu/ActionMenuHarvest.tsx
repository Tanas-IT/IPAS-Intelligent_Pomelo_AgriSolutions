import { FC } from "react";
import { Icons } from "@/assets";
import ActionMenu from "./ActionMenu/ActionMenu";

interface ActionMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  onOpenRecordModal: () => void;
  onImport: () => void;
}

const ActionMenuHarvest: FC<ActionMenuProps> = ({
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
    {
      icon: <Icons.fileAdd />,
      label: "Record Harvest",
      onClick: () => onOpenRecordModal(),
    },
    {
      icon: <Icons.upload />,
      label: "Import Harvest",
      onClick: onImport,
    },
  ];

  return (
    <>
      <ActionMenu title="Harvest Manage" items={actionItems} />
    </>
  );
};

export default ActionMenuHarvest;
