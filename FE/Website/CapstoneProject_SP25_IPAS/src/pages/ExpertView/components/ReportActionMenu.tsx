// import { FC } from "react";
// import { Icons } from "@/assets";
// import { useNavigate } from "react-router-dom";
// import { ActionMenu } from "@/components";

// interface ReportActionMenuProps {
//   reportId: number;
//   onReply: () => void;
//   onViewDetails: () => void;
//   onAddToTraining: () => void;
// }

// const ReportActionMenu: FC<ReportActionMenuProps> = ({ 
//   reportId, 
//   onReply,
//   onViewDetails,
//   onAddToTraining
// }) => {
//   const navigate = useNavigate();
  

//   const actionItems = [
//     {
//       icon: <Icons.detail />,
//       label: "View Details",
//       onClick: onViewDetails,
//     },
//     {
//       icon: <Icons.edit />,
//       label: "Reply Report",
//       onClick: onReply,
//     },
//     {
//       icon: <Icons.addPLan />,
//       label: "Add to Training",
//       onClick: onAddToTraining,
//     },
//   ];

//   return <ActionMenu title="Report Actions" items={actionItems} />;
// };

// export default ReportActionMenu;
import { FC } from "react";
import { Icons } from "@/assets";
import { ActionMenu } from "@/components";
import { GetReportResponse } from "@/payloads"; // Giả định import từ payloads

interface ReportActionMenuProps {
  reportId: number;
  report: GetReportResponse; // Thêm report để kiểm tra isTrainned
  onReply: () => void;
  onViewDetails: () => void;
  onAddToTraining: () => void;
}

const ReportActionMenu: FC<ReportActionMenuProps> = ({
  reportId,
  report,
  onReply,
  onViewDetails,
  onAddToTraining
}) => {
  const actionItems = [
    {
      icon: <Icons.detail />,
      label: "View Details",
      onClick: onViewDetails,
    },
    {
      icon: <Icons.edit />,
      label: "Reply Report",
      onClick: onReply,
    },
    ...(report.isTrainned
      ? [] // Nếu isTrainned === true, không thêm "Add to Training"
      : [
          {
            icon: <Icons.addPLan />,
            label: "Add to Training",
            onClick: onAddToTraining,
          },
        ]),
  ];

  return <ActionMenu title="Report Actions" items={actionItems} />;
};

export default ReportActionMenu;