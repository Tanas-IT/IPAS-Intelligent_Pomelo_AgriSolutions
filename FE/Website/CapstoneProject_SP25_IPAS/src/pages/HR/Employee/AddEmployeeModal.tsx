import { AutoComplete, Button, Empty, Flex, Form, Input, Select, Spin } from "antd";
import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { ModalForm, UserAvatar } from "@/components";
import { employeeService } from "@/services";
import { GetUserRoleEmployee, Skill } from "@/payloads";
import { useMasterTypeOptions } from "@/hooks";
import { MASTER_TYPE } from "@/constants";
import style from "./EmployeeList.module.scss";
import { DeleteOutlined } from "@ant-design/icons";

type AddEmployeeModelProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: number, skills: Skill[]) => void;
  isLoadingAction?: boolean;
};

const AddEmployeeModel = ({ isOpen, onClose, onSave, isLoadingAction }: AddEmployeeModelProps) => {
  const [form] = Form.useForm();
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<GetUserRoleEmployee[]>([]);
  const [selectedUser, setSelectedUser] = useState<GetUserRoleEmployee | null>(null);
  const { options: worklogTypeOptions } = useMasterTypeOptions(MASTER_TYPE.WORK, false);

  useEffect(() => {
    if (!isOpen) return;
    form.resetFields(); // reset toàn bộ form khi mở
    setOptions([]);
    setSelectedUser(null);
    setSearch("");
  }, [isOpen, form]);

  useEffect(() => {
    const fetchUser = async () => {
      if (!debouncedSearch) {
        setOptions([]);
        return;
      }
      setLoading(true);
      try {
        const res = await employeeService.getUserByEmail(debouncedSearch);
        if (res.statusCode === 200 && res.data) {
          setOptions(res.data);
        } else {
          setOptions([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [debouncedSearch]);

  const handleSave = async () => {
    const values = await form.validateFields();
    if (!selectedUser) return;

    const validSkills: Skill[] = (values.skills || []).map(
      (skill: { skillId: number; score: number }) => ({
        skillID: skill.skillId,
        scoreOfSkill: skill.score,
      }),
    );

    onSave(selectedUser.userId, validSkills);
  };

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleSave}
      isLoading={isLoadingAction}
      title="Add New Employee"
      noDivider
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Employee" required>
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
            notFoundContent={
              loading ? <Spin size="small" /> : <Empty description="No data found" />
            }
          >
            <Input.Search loading={loading} allowClear />
          </AutoComplete>
        </Form.Item>

        <Form.List name="skills" initialValue={[{ skillId: null, score: null }]}>
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name }, index) => (
                <Flex key={key} gap={20} justify="center" align="center">
                  <Form.Item
                    label="Skill"
                    name={[name, "skillId"]}
                    rules={[{ required: true, message: "Please select a skill" }]}
                    style={{ flex: 1 }}
                  >
                    <Select placeholder="Select skill" options={worklogTypeOptions} showSearch />
                  </Form.Item>
                  <Form.Item
                    label="Score"
                    name={[name, "score"]}
                    rules={[{ required: true, message: "Please enter a score" }]}
                    style={{ flex: 1 }}
                  >
                    <Input type="number" placeholder="Enter score (1-10)" min={1} max={10} />
                  </Form.Item>
                  <Button
                    style={{ marginTop: 8 }}
                    icon={<DeleteOutlined />}
                    onClick={() => remove(name)}
                    disabled={fields.length === 1}
                  />
                </Flex>
              ))}
              <Button onClick={() => add({ skillId: null, score: null })} disabled={!selectedUser}>
                Add Skill
              </Button>
            </>
          )}
        </Form.List>
      </Form>
    </ModalForm>
  );
};

export default AddEmployeeModel;
