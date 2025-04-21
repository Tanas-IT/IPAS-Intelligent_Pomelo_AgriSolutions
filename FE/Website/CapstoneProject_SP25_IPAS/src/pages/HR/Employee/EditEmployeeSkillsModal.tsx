import { Button, Flex, Input, Select, Form } from "antd";
import { useState, useEffect } from "react";
import { ModalForm } from "@/components";
import { Skill } from "@/payloads";
import { useMasterTypeOptions } from "@/hooks";
import { MASTER_TYPE } from "@/constants";
import { DeleteOutlined } from "@ant-design/icons";

type SkillInput = {
  skillId: number | null;
  score: number | null;
};

type EditEmployeeSkillsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (skills: Skill[]) => void;
  initialSkills?: Skill[];
  isLoadingAction?: boolean;
};

const EditEmployeeSkillsModal = ({
  isOpen,
  onClose,
  onSave,
  initialSkills = [],
  isLoadingAction,
}: EditEmployeeSkillsModalProps) => {
  const { options: worklogTypeOptions } = useMasterTypeOptions(MASTER_TYPE.WORK, false);
  console.log("skill", initialSkills);

  const [skills, setSkills] = useState<SkillInput[]>([{ skillId: null, score: null }]);

  useEffect(() => {
    if (isOpen) {
      setSkills(
        initialSkills.length > 0
          ? initialSkills.map(skill => ({
              skillId: skill.skillID,
              score: skill.scoreOfSkill,
            }))
          : [{ skillId: null, score: null }],
      );
    }
  }, [isOpen, initialSkills]);

  const handleAddSkill = () => {
    setSkills([...skills, { skillId: null, score: null }]);
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSkillChange = (index: number, field: keyof SkillInput, value: number | null) => {
    const newSkills = [...skills];
    newSkills[index] = { ...newSkills[index], [field]: value };
    setSkills(newSkills);
  };

  const handleSave = () => {
    const validSkills: Skill[] = skills
      .filter((skill): skill is { skillId: number; score: number } =>
        skill.skillId !== null && skill.score !== null
      )
      .map(skill => ({
        skillID: skill.skillId,
        scoreOfSkill: skill.score,
      }));
    onSave(validSkills);
  };

  const isSaveDisabled = skills.some(skill => !skill.skillId || !skill.score);

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleSave}
      isLoading={isLoadingAction}
      title="Edit Employee Skills"
      noDivider={true}
      isUpdate
    >
      <div style={{ marginTop: 16 }}>
        {skills.map((skill, index) => (
          <Flex key={index} gap={8} style={{ marginBottom: 16 }}>
            <Form.Item
              label="Skill"
              required
              validateStatus={skill.skillId ? "" : "error"}
              help={skill.skillId ? "" : "Please select a skill"}
              style={{ flex: 1 }}
            >
              <Select
                placeholder="Select skill"
                options={worklogTypeOptions}
                value={skill.skillId}
                onChange={(value) => handleSkillChange(index, "skillId", value)}
                showSearch
              />
            </Form.Item>
            <Form.Item
              label="Score"
              required
              validateStatus={skill.score ? "" : "error"}
              help={skill.score ? "" : "Please enter a score"}
              style={{ flex: 1 }}
            >
              <Input
                type="number"
                placeholder="Enter score (1-10)"
                value={skill.score ?? undefined}
                onChange={(e) =>
                  handleSkillChange(index, "score", parseInt(e.target.value) || null)
                }
                min={1}
                max={10}
              />
            </Form.Item>
            <Button
              icon={<DeleteOutlined />}
              onClick={() => handleRemoveSkill(index)}
              disabled={skills.length === 1}
              style={{ marginTop: 8 }}
            />
          </Flex>
        ))}
      </div>

      <Button
        onClick={handleAddSkill}
        style={{ marginTop: 8 }}
      >
        Add Skill
      </Button>
    </ModalForm>
  );
};

export default EditEmployeeSkillsModal;