import React from "react";
import { Avatar, Button, Tooltip, Radio } from "antd";
import { Icons } from "@/assets";
import style from "./AssignMembers.module.scss";

interface Employee {
  fullName: string;
  avatarURL: string;
  userId: number;
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
      <span className={style.label}>Assigned to project</span>
      <div className={style.avatars}>
        {members.map((member) => (
          <Tooltip title={member.fullName} key={member.userId}>
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
      <Button className={style.btnAssign} icon={<Icons.addUser />} onClick={onAssign}>
        Assign Member
      </Button>
    </div>
  );
};

export default AssignEmployee;
