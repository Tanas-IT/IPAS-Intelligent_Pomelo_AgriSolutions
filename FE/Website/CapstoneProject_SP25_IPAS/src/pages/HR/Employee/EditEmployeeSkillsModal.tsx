import { Button, Flex, Input, Select, Form } from "antd";
import { useEffect } from "react";
import { ModalForm } from "@/components";
import { Skill } from "@/payloads";
import { useMasterTypeOptions } from "@/hooks";
import { MASTER_TYPE } from "@/constants";
import { DeleteOutlined } from "@ant-design/icons";

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
  const [form] = Form.useForm();
  const { options: worklogTypeOptions } = useMasterTypeOptions(MASTER_TYPE.WORK, false);

  useEffect(() => {
    if (isOpen) {
      form.resetFields();
      if (initialSkills.length > 0) {
        form.setFieldsValue({
          skills: initialSkills.map((skill) => ({
            skillId: skill.skillID,
            score: skill.scoreOfSkill,
          })),
        });
      } else {
        form.setFieldsValue({ skills: [{ skillId: null, score: null }] });
      }
    }
  }, [isOpen, initialSkills, form]);

  const handleSave = async () => {
    const values = await form.validateFields();
    const validSkills: Skill[] = (values.skills || []).map(
      (skill: { skillId: number; score: number }) => ({
        skillID: skill.skillId,
        scoreOfSkill: skill.score,
      }),
    );
    onSave(validSkills);
  };

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleSave}
      isLoading={isLoadingAction}
      title="Edit Employee Skills"
      noDivider
      isUpdate
    >
      <Form form={form} layout="vertical">
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
                    icon={<DeleteOutlined />}
                    onClick={() => remove(name)}
                    disabled={fields.length === 1}
                    style={{ marginTop: 8 }}
                  />
                </Flex>
              ))}
              <Button onClick={() => add({ skillId: null, score: null })}>Add Skill</Button>
            </>
          )}
        </Form.List>
      </Form>
    </ModalForm>
  );
};

export default EditEmployeeSkillsModal;
