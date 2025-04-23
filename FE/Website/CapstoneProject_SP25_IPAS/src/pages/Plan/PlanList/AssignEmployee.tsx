import React from "react";
import { Avatar, Button, Tooltip, Radio, Flex, Tag } from "antd";
import { Icons } from "@/assets";
import style from "./AssignEmployee.module.scss";

interface SkillWithScore {
  skillName: string;
  score: number;
}

interface Employee {
  fullName: string;
  avatarURL: string;
  userId: number;
  skillWithScore: SkillWithScore[];
}

interface AssignMembersProps {
  members: Employee[] | undefined;
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
  const formatSkills = (skills: SkillWithScore[]) => {
    return skills.length > 0
      ? skills.map(skill => (
        <Tag
          key={skill.skillName}
          icon={<Icons.score style={{ color: "#52c41a" }} />}
          color="geekblue"
        >
          {skill.skillName} <span style={{ fontWeight: "bold" }}>({skill.score})</span>
        </Tag>
      ))
      : <Tag>No skills</Tag>;
  };

  return (
    <div className={style.assignMembers}>
      <Flex vertical gap={20}>
        <Flex justify="space-between" align="center">
          <span className={style.label}>Assigned Team Members</span>
          <Button
            className={style.btnAssign}
            icon={<Icons.addUser style={{ marginRight: 8 }} />}
            onClick={onAssign}
          >
            Assign Member
          </Button>
        </Flex>

        <div className={style.membersContainer}>
          {Array.isArray(members) && members.length > 0 ? (
            members.map((member) => (
              <div
                key={member.userId}
                className={style.memberCard}
                data-selected={selectedReporter === member.userId}
                onClick={() => onReporterChange(member.userId)}
              >
                <Flex align="center" gap={16}>
                  <Avatar
                    src={member.avatarURL}
                    size={48}
                    className={style.avatar}
                    crossOrigin="anonymous"
                  />

                  <Flex vertical style={{ flex: 1 }}>
                    <span className={style.memberName}>{member.fullName}</span>
                    <Flex gap={4} wrap="wrap" className={style.skillsContainer}>
                      {member?.skillWithScore?.map(skill => (
                        <Tag
                          key={skill.skillName}
                          icon={<Icons.score size={12} />}
                          color={skill.score > 7 ? "green" : "blue"}
                        >
                          {skill.skillName} ({skill.score})
                        </Tag>
                      ))}
                    </Flex>
                  </Flex>

                  <Radio
                    checked={selectedReporter === member.userId}
                    className={style.reporterRadio}
                  >
                    <Icons.score
                      style={{
                        color: selectedReporter === member.userId ? "#ffc53d" : "#d9d9d9",
                        transition: 'all 0.3s',
                        marginRight: '3px'
                      }}
                    />
                    <span>Reporter</span>
                  </Radio>
                </Flex>
              </div>
            ))
          ) : (
            <p className={style.noMembers}>No members assigned yet</p>
          )}
        </div>
      </Flex>
    </div>
  );
};

export default AssignEmployee;