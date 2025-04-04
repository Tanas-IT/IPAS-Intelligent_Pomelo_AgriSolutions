import { ColumnsType } from "antd/es/table";
import { Icons } from "@/assets";
import { CriteriaRequest } from "@/payloads";
import { RulesManager } from "@/utils";
import style from "./Criteria.module.scss";
import { Button, Form, Input, InputNumber } from "antd";

export const CriteriaColModal = (
  form: any,
  handleInputChange: () => void,
  deleteCriteria: (id: number) => void,
): ColumnsType<CriteriaRequest> => [
  {
    title: "Criteria Name",
    dataIndex: "criteriaName",
    align: "center" as const,
    width: 200,
    render: (_: any, record: CriteriaRequest, index: number) => (
      <Form.Item
        className={style.noMargin}
        name={["criteriaList", index, "criteriaName"]}
        rules={RulesManager.getCriteriaRules()}
        tooltip
      >
        <Input
          placeholder="Enter criteria name"
          value={record.criteriaName}
          onChange={handleInputChange}
        />
      </Form.Item>
    ),
  },
  {
    title: "Description",
    dataIndex: "criteriaDescription",
    align: "center" as const,
    render: (_: any, record: CriteriaRequest, index: number) => (
      <Form.Item name={["criteriaList", index, "criteriaDescription"]} className={style.noMargin}>
        <Input.TextArea
          placeholder="Enter description"
          autoSize={{ minRows: 1, maxRows: 3 }}
          value={record.criteriaDescription}
          onChange={handleInputChange}
        />
      </Form.Item>
    ),
  },
  {
    title: "Min Value",
    dataIndex: "minValue",
    align: "center" as const,
    width: 100,
    render: (_: any, record: CriteriaRequest, index: number) => (
      <Form.Item
        className={style.noMargin}
        name={["criteriaList", index, "minValue"]}
        rules={RulesManager.getNumberRules("Min Value")}
      >
        <InputNumber
          min={0.1}
          className={style.inputNumberField}
          value={record.minValue}
          onChange={handleInputChange}
          placeholder="Value..."
        />
      </Form.Item>
    ),
  },
  {
    title: "Max Value",
    dataIndex: "maxValue",
    align: "center" as const,
    width: 100,
    render: (_: any, record: CriteriaRequest, index: number) => (
      <Form.Item
        className={style.noMargin}
        name={["criteriaList", index, "maxValue"]}
        rules={[
          ...RulesManager.getNumberRules("Max Value"),
          {
            validator: async (_, value) => {
              const minValue = form.getFieldValue(["criteriaList", index, "minValue"]);
              if (
                value !== undefined &&
                minValue !== undefined &&
                Number(value) <= Number(minValue)
              ) {
                return Promise.reject(new Error("Max Value must be greater than Min Value!"));
              }
              return Promise.resolve();
            },
          },
        ]}
        dependencies={[["criteriaList", index, "minValue"]]}
      >
        <InputNumber
          className={style.inputNumberField}
          value={record.maxValue}
          onChange={handleInputChange}
          placeholder="Value..."
        />
      </Form.Item>
    ),
  },
  {
    title: "Unit",
    dataIndex: "unit",
    align: "center" as const,
    width: 140,
    render: (_: any, record: CriteriaRequest, index: number) => (
      <Form.Item
        className={style.noMargin}
        name={["criteriaList", index, "unit"]}
        rules={RulesManager.getUnitRules()}
      >
        <Input placeholder="Enter unit" value={record.unit} onChange={handleInputChange} />
      </Form.Item>
    ),
  },
  {
    title: "Priority",
    dataIndex: "priority",
    align: "center" as const,
    width: 70,
    render: (_: any, record: CriteriaRequest, index: number) => (
      <Form.Item
        className={style.noMargin}
        name={["criteriaList", index, "priority"]}
        rules={RulesManager.getPriorityRules()}
      >
        <InputNumber
          className={style.inputNumberField}
          min={1}
          value={record.priority}
          onChange={handleInputChange}
        />
      </Form.Item>
    ),
  },
  {
    title: "Check Interval Days ",
    dataIndex: "frequencyDate",
    align: "center" as const,
    render: (_: any, record: CriteriaRequest, index: number) => (
      <Form.Item
        className={style.noMargin}
        name={["criteriaList", index, "frequencyDate"]}
        rules={RulesManager.getCheckIntervalDaysRules()}
      >
        <InputNumber
          className={style.inputNumberField}
          min={1}
          value={record.frequencyDate}
          onChange={handleInputChange}
          placeholder="Value..."
        />
      </Form.Item>
    ),
  },
  {
    title: "Action",
    dataIndex: "action",
    align: "center" as const,
    render: (_: any, record: CriteriaRequest) => (
      <Button danger onClick={() => deleteCriteria(record.criteriaId)} icon={<Icons.delete />} />
    ),
  },
];
