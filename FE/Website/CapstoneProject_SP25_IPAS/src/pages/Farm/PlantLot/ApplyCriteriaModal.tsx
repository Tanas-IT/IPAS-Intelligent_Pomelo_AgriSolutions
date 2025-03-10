import { Flex, Form, Table } from "antd";
import { useState, useEffect } from "react";
import { FormFieldModal, ModalForm } from "@/components";
import { RulesManager } from "@/utils";
import { CRITERIA_TARGETS, lotFormFields, PARTNER, WORK_TARGETS } from "@/constants";
import { GetCriteria, GetPlantLot2, PlantLotRequest } from "@/payloads";
import { criteriaService, partnerService } from "@/services";
import { SelectOption } from "@/types";
import { useCriteriaOptions, useMasterTypeOptions } from "@/hooks";
import style from "./PlantLot.module.scss";
import { Icons } from "@/assets";

type ApplyCriteriaModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  isLoadingAction?: boolean;
  //   lotData?: GetPlantLot2;
};

const ApplyCriteriaModal = ({
  isOpen,
  onClose,
  onSave,
  isLoadingAction,
}: ApplyCriteriaModalProps) => {
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState<(GetCriteria & { key: number; index: number })[]>(
    [],
  );
  const { options: criteriaTypeOptions } = useCriteriaOptions(
    CRITERIA_TARGETS["Plant Lot Evaluation"],
  );

  //   const isUpdate = lotData !== undefined && Object.keys(lotData).length > 0;

  const resetForm = () => {
    form.resetFields(); // Reset toàn bộ form
    setDataSource([]); // Xóa danh sách tiêu chí khi reset
    form.setFieldsValue({ [lotFormFields.partnerId]: undefined }); // Reset giá trị select
  };

  useEffect(() => {
    resetForm();
    if (isOpen) {
    }
  }, [isOpen]);

  //   const handleOk = async () => {
  //     await form.validateFields();
  //     // console.log(getFormData());
  //   };

  //   const handleCancel = () => onClose(getFormData(), isUpdate);

  // Array.from({ length: 5 }, (_, index) => ({
  //   key: index + 1,
  //   index: index + 1,
  //   name: "Chiều cao > 2m",
  //   description: "Chiều cao tính từ gốc đến điểm cao nhất",
  //   priority: 1,
  // })),

  const handleCriteriaTypeChange = async (value: string) => {
    const res = await criteriaService.getCriteriaByMasterType(Number(value));

    if (res.statusCode === 200) {
      const criteriaList: GetCriteria[] = res.data?.criterias || [];
      const formattedCriteria = criteriaList.map((criteria, index) => ({
        ...criteria,
        key: index + 1, // Key phải là unique
        index: index + 1, // Dùng để hiển thị số thứ tự
      }));

      setDataSource(formattedCriteria);
    }
  };

  const handleDelete = (key: number) => {
    setDataSource(dataSource.filter((item) => item.key !== key));
  };

  const columns = [
    {
      title: "#",
      dataIndex: "index",
      key: "index",
      align: "center" as const,
      render: (text: number) => <a>{text}</a>,
    },
    {
      title: "Name",
      dataIndex: "criteriaName",
      key: "criteriaName",
      align: "center" as const,
    },
    {
      title: "Description",
      dataIndex: "criteriaDescription",
      key: "criteriaDescription",
      align: "center" as const,
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      align: "center" as const,
    },
    {
      title: "Action",
      key: "action",
      align: "center" as const,
      render: (_: any, record: { key: number }) => (
        <span className={style.actionIcon} onClick={() => handleDelete(record.key)}>
          <Icons.delete />
        </span>
      ),
    },
  ];

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      isLoading={isLoadingAction}
      title={"Apply Criteria"}
      saveLabel="Apply"
      size="largeXL"
    >
      <Form form={form} layout="vertical">
        <FormFieldModal
          type="select"
          label="Choose criteria type"
          placeholder="Select criteria type"
          name={lotFormFields.partnerId}
          rules={RulesManager.getTypeRules()}
          options={criteriaTypeOptions}
          direction="row"
          onChange={handleCriteriaTypeChange}
        />
      </Form>
      <Flex vertical gap={10}>
        <label className={style.formTitle}>Criteria List:</label>
        <div className={style.criteriaTableWrapper}>
          <Table
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            bordered
            className={style.criteriaTable}
          />
        </div>
      </Flex>
    </ModalForm>
  );
};

export default ApplyCriteriaModal;
