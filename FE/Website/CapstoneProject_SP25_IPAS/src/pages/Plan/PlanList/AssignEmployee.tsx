// import React from "react";
// import { Avatar, Button, Tooltip, Radio, Flex } from "antd";
// import { Icons } from "@/assets";
// import style from "./AssignMembers.module.scss";

// interface Employee {
//   fullName: string;
//   avatarURL: string;
//   userId: number;
// }

// interface AssignMembersProps {
//   members: Employee[];
//   onAssign: () => void;
//   onReporterChange: (userId: number) => void;
//   selectedReporter: number | null;
// }

// const AssignEmployee: React.FC<AssignMembersProps> = ({ 
//   members, 
//   onAssign, 
//   onReporterChange, 
//   selectedReporter 
// }) => {
//   return (
//     <div className={style.assignMembers}>
//       <Flex vertical gap={20}>
//         <Flex vertical={false} gap={30}>
//       <span className={style.label}>Assigned to project</span>
//       <Button className={style.btnAssign} icon={<Icons.addUser />} onClick={onAssign}>
//         Assign Member
//       </Button>
//       </Flex>
//       <div className={style.avatars}>
//         {members.map((member) => (
//           <Tooltip title={member.fullName} key={member.userId}>
//             <div className={style.memberItem}>
//               <Avatar src={member.avatarURL} className={style.avatar} crossOrigin="anonymous" />
//               <Radio 
//                 checked={selectedReporter === member.userId} 
//                 onChange={() => onReporterChange(member.userId)}
//               >
//                 Reporter
//               </Radio>
//             </div>
//           </Tooltip>
//         ))}
//       </div>
//       </Flex>
      
//     </div>
//   );
// };

// export default AssignEmployee;
import React from "react";
import { Avatar, Button, Tooltip, Radio, Flex } from "antd";
import { Icons } from "@/assets";
import style from "./AssignMembers.module.scss";

interface Employee {
  fullName: string;
  avatarURL: string;
  userId: number;
  workSkillName: string[];
  scoreOfSkill: number;
}

interface AssignMembersProps {
  members: Employee[];
  onAssign: () => void;
  onReporterChange: (userId: number) => void;
  selectedReporter: number | null;
}

const AssignEmployee: React.FC<AssignMembersProps> = ({ 
  members, 
  onAssign, 
  onReporterChange, 
  selectedReporter 
}) => {
  return (
    <div className={style.assignMembers}>
      <Flex vertical gap={20}>
        <Flex vertical={false} gap={30}>
          <span className={style.label}>Assigned to project</span>
          <Button className={style.btnAssign} icon={<Icons.addUser />} onClick={onAssign}>
            Assign Member
          </Button>
        </Flex>
        <div className={style.avatars}>
          {members.map((member) => (
            <Tooltip title={`${member.fullName} - Skills: ${member.workSkillName.join(", ") || "None"} - Score: ${member.scoreOfSkill}`} key={member.userId}>
              <div className={style.memberItem}>
                <Avatar src={member.avatarURL} className={style.avatar} crossOrigin="anonymous" />
                <Radio 
                  checked={selectedReporter === member.userId} 
                  onChange={() => onReporterChange(member.userId)}
                >
                  Reporter
                </Radio>
              </div>
            </Tooltip>
          ))}
        </div>
      </Flex>
    </div>
  );
};

export default AssignEmployee;