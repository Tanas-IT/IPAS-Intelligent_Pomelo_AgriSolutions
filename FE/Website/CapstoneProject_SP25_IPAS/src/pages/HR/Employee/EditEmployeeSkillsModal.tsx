import { Button, Flex, Input, Select, Form } from "antd";
import { useEffect } from "react";
import { ModalForm } from "@/components";
import { Skill } from "@/payloads";
import { useMasterTypeOptions } from "@/hooks";
import { MASTER_TYPE } from "@/constants";
import { DeleteOutlined } from "@ant-design/icons";
import { RulesManager } from "@/utils";
import { toast } from "react-toastify";

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
    const rawSkills = values.skills || [];

    // Kiểm tra nếu có skillId thì bắt buộc phải có score
    const isInvalid = rawSkills.some(
      (skill: { skillId?: number; score?: number }) =>
        skill.skillId && (skill.score === undefined || skill.score === null),
    );

    if (isInvalid) {
      toast.warning("Each skill must have a score between 1 and 10.");
      return;
    }

    // Chỉ lấy những skill hợp lệ: có cả skillId và score
    const validSkills: Skill[] = rawSkills
      .filter(
        (skill: { skillId?: number; score?: number }) =>
          skill.skillId !== undefined && skill.score !== undefined && skill.score !== null,
      )
      .map((skill: { skillId?: number; score?: number }) => ({
        skillID: skill.skillId,
        scoreOfSkill: skill.score,
      }));

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
                  <Form.Item label="Skill" name={[name, "skillId"]} style={{ flex: 1 }}>
                    <Select
                      placeholder="Select skill"
                      options={worklogTypeOptions}
                      showSearch
                      allowClear
                    />
                  </Form.Item>
                  <Form.Item
                    label="Score"
                    name={[name, "score"]}
                    style={{ flex: 1 }}
                    rules={RulesManager.getNumberInRange1To10Rules("Score")}
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
