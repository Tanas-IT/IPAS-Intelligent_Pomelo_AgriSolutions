// 
import React from "react";
import { Avatar, Button, Tooltip } from "antd";
import { UserAddOutlined } from "@ant-design/icons";
import style from "./AssignMembers.module.scss";
import { Icons } from "@/assets";

interface AssignMembersProps {
  members: { name: string; avatar: string }[];
  onAssign: () => void;
}

const AssignEmployees: React.FC<AssignMembersProps> = ({ members, onAssign }) => {
  return (
    <div className={style.assignMembers}>
      <span className={style.label}>Assigned to project</span>
      <div className={style.avatars}>
        {members.slice(0, 3).map((member, index) => (
          <Tooltip title={member.name} key={index}>
            <Avatar src={member.avatar} className={style.avatar} />
          </Tooltip>
        ))}
        {members.length > 3 && <span className={style.more}>+{members.length - 3}</span>}
      </div>
      <Button className={style.btnAssign} icon={<Icons.addUser />} onClick={onAssign}>
        Assign Member
      </Button>
    </div>
  );
};

export default AssignEmployees;
