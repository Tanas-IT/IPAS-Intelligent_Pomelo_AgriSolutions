import { Flex, Tag, Tooltip } from "antd";
import style from "./Details.module.scss";
import { Icons } from "@/assets";
import { ActionMenuProduct } from "@/components";

import { useModal } from "@/hooks";
import { MASTER_TYPE } from "@/constants";
import { GetMasterTypeDetail } from "@/payloads";
import { isEmployee } from "@/utils";

const ProductSectionHeader = ({
  product,
  formModal,
  deleteConfirmModal,
  criteriaModal,
}: {
  product?: GetMasterTypeDetail;
  formModal?: ReturnType<typeof useModal<GetMasterTypeDetail>>;
  deleteConfirmModal?: ReturnType<typeof useModal<{ id: number }>>;
  criteriaModal?: ReturnType<typeof useModal<{ id: number }>>;
}) => {
  if (!product || (product && product.typeName !== MASTER_TYPE.PRODUCT)) return;
  const isEmployeeIn = isEmployee();

  return (
    <Flex className={style.contentSectionHeader}>
      <Flex className={style.contentSectionTitle}>
        <Flex className={style.contentSectionTitleLeft}>
          <label className={style.title}>{product.masterTypeName}</label>
          <Tooltip title="Product">
            <Icons.tag className={style.iconTag} />
          </Tooltip>
          <Tag className={style.statusTag} color={product.isActive ? "green" : "red"}>
            {product.isActive ? "Active" : "Inactive"}
          </Tag>
        </Flex>
        {!isEmployeeIn && (
          <Flex>
            <ActionMenuProduct
              onEdit={() => formModal?.showModal(product)}
              onDelete={() => deleteConfirmModal?.showModal({ id: product.masterTypeId })}
              onApplyCriteria={() => criteriaModal?.showModal({ id: product.masterTypeId })}
            />
          </Flex>
        )}
      </Flex>
      <label className={style.subTitle}>Code: {product.masterTypeCode}</label>
    </Flex>
  );
};

export default ProductSectionHeader;
