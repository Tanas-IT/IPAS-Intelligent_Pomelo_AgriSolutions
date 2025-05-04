import React from "react";
import styles from "./EmployeeOptionLabel.module.scss";
import { SkillWithScore } from "@/payloads/worklog";
import { Icons } from "@/assets";
import UserAvatar from "../UserAvatar";
import { Tooltip } from "@/components";

interface EmployeeOptionLabelProps {
  avatarURL?: string;
  fullName: string;
  skillWithScore: SkillWithScore[];
}

const EmployeeOptionLabel: React.FC<EmployeeOptionLabelProps> = ({
  avatarURL,
  fullName,
  skillWithScore,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.avatarWrapper}>
        <UserAvatar avatarURL={avatarURL || undefined} size={38} />
      </div>

      <div
        // className={styles.contentRow}
        className={skillWithScore.length <= 3 ? styles.contentRow : styles.content}
      >
        <div className={styles.name}>{fullName}</div>

        <div className={styles.skills}>
          {skillWithScore.length === 0 ? (
            <div className={`${styles.skillItem} ${styles.low}`}>No skills</div>
          ) : (
            <>
              {skillWithScore.slice(0, 3).map((skill) => (
                <div
                  key={skill.skillName}
                  className={`${styles.skillItem} ${skill.score >= 7 ? styles.high : styles.low}`}
                >
                  <Icons.grade width={12} height={12} className={styles.skillIcon} />
                  <span className={styles.skillText}>
                    {skill.skillName} <strong>{skill.score}</strong>
                  </span>
                </div>
              ))}
              {skillWithScore.length > 3 && (
                <Tooltip
                  placement="top"
                  color="#fff"
                  title={
                    <div className={styles.tooltipContent}>
                      {skillWithScore.slice(3).map((skill) => (
                        <div
                          key={skill.skillName}
                          className={`${styles.skillItem} ${
                            skill.score >= 7 ? styles.high : styles.low
                          }`}
                        >
                          <Icons.grade width={12} height={12} className={styles.skillIcon} />
                          <span className={styles.skillText}>
                            {skill.skillName} <strong>{skill.score}</strong>
                          </span>
                        </div>
                      ))}
                    </div>
                  }
                >
                  <div className={styles.moreSkills}>+{skillWithScore.length - 3}</div>
                </Tooltip>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeOptionLabel;
