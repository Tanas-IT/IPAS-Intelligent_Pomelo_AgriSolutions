import { AutoComplete, Button, Empty, Flex, Input, Select, Spin, Form } from "antd";
import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { ModalForm, UserAvatar } from "@/components";
import { employeeService } from "@/services";
import { GetUserRoleEmployee, Skill } from "@/payloads";
import { useMasterTypeOptions } from "@/hooks";
import { MASTER_TYPE } from "@/constants";
import style from "./EmployeeList.module.scss";
import { DeleteOutlined } from "@ant-design/icons";

type SkillInput = {
  skillId: number | null;
  score: number | null;
};

type AddEmployeeModelProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: number, skills: Skill[]) => void;
  isLoadingAction?: boolean;
};

const AddEmployeeModel = ({ isOpen, onClose, onSave, isLoadingAction }: AddEmployeeModelProps) => {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<GetUserRoleEmployee[]>([]);
  const [selectedUser, setSelectedUser] = useState<GetUserRoleEmployee | null>(null);
  const { options: worklogTypeOptions } = useMasterTypeOptions(MASTER_TYPE.WORK, false);
  const [skills, setSkills] = useState<SkillInput[]>([{ skillId: null, score: null }]);

  useEffect(() => {
    if (!isOpen) return;
    setOptions([]);
    setSelectedUser(null);
    setSearch("");
    setSkills([{ skillId: null, score: null }]);
  }, [isOpen]);

  useEffect(() => {
    const fetchUser = async () => {
      if (!debouncedSearch) {
        setOptions([]);
        return;
      }

      setLoading(true);
      try {
        const res = await employeeService.getUserByEmail(debouncedSearch);
        if (res.statusCode === 200) {
          if (res.data) {
            setOptions(res.data);
          } else {
            setOptions([]);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [debouncedSearch]);

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
    if (!selectedUser) return;
    const validSkills: Skill[] = skills
      .filter((skill): skill is { skillId: number; score: number } => 
        skill.skillId !== null && skill.score !== null
      )
      .map(skill => ({
        skillID: skill.skillId,
        scoreOfSkill: skill.score
      }));
    onSave(selectedUser.userId, validSkills);
  };

  const isSaveDisabled = !selectedUser || skills.some(skill => !skill.skillId || !skill.score);

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleSave}
      isLoading={isLoadingAction}
      title="Add New Employee"
      noDivider={true}
    >
      <AutoComplete
        className={style.addEmployeeModal}
        options={options.map((user) => ({
          value: user.userId.toString(),
          label: (
            <Flex align="center" gap={8}>
              <UserAvatar avatarURL={user?.avatarURL} />
              <span>
                {user.fullName} ({user.email})
              </span>
            </Flex>
          ),
        }))}
        value={selectedUser ? selectedUser.email : search}
        onSearch={(value) => {
          setSearch(value);
          setSelectedUser(null);
        }}
        onSelect={(value) => {
          const user = options.find((opt) => opt.userId.toString() === value);
          if (user) {
            setSelectedUser(user);
            setSearch(user.email);
          }
        }}
        placeholder="Enter employee email"
        notFoundContent={loading ? <Spin size="small" /> : <Empty description="No data found" />}
      >
        <Input.Search loading={loading} allowClear />
      </AutoComplete>

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
            />
          </Flex>
        ))}
      </div>

      <Button
        onClick={handleAddSkill}
        style={{ marginTop: 8 }}
        disabled={!selectedUser}
      >
        Add Skill
      </Button>
    </ModalForm>
  );
};

export default AddEmployeeModel;