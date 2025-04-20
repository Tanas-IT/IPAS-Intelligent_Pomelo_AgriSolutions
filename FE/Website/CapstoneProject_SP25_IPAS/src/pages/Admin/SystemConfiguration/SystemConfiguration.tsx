import { Flex, Select } from "antd";
import style from "./SystemConfiguration.module.scss";
import {
  ConfirmModal,
  NavigationDot,
  SectionTitle,
  Table,
  TableTitle,
  ActionMenuSystemConfig,
  SysConfigurationModal,
} from "@/components";
import { GetSystemConfig, SystemConfigRequest } from "@/payloads";
import {
  useTableDelete,
  useFetchData,
  useModal,
  useTableUpdate,
  useTableAdd,
  useFilters,
  useHasChanges,
} from "@/hooks";
import { useEffect, useState } from "react";
import { DEFAULT_CONFIG_FILTERS, getOptions } from "@/utils";
import { systemConfigService } from "@/services";
import { FilterConfigTypeState, SelectOption } from "@/types";
import { SystemConfigurationCols } from "./SystemConfigurationCols";
import SystemConfigurationFilter from "./SystemConfigurationFilter";

function SystemConfiguration() {
  const formModal = useModal<GetSystemConfig>();
  const deleteConfirmModal = useModal<{ id: number[] }>();
  const updateConfirmModal = useModal<{ config: SystemConfigRequest }>();
  const cancelConfirmModal = useModal();
  const [groupOptions, setGroupOptions] = useState<SelectOption[]>([]);
  const [group, setGroup] = useState<string>("");

  useEffect(() => {
    const fetchGroups = async () => {
      const res = await systemConfigService.getSystemConfigGroupSelect();
      if (res.statusCode === 200) {
        const options: SelectOption[] = res.data.map((item) => ({
          value: item.name,
          label: item.name,
        }));
        setGroupOptions(options);
      }
    };

    fetchGroups();
  }, []);

  useEffect(() => {
    if (groupOptions.length > 0 && !group) setGroup(String(groupOptions[0].value));
  }, [groupOptions]);

  const { filters, updateFilters, applyFilters, clearFilters } = useFilters<FilterConfigTypeState>(
    DEFAULT_CONFIG_FILTERS,
    () => fetchData(1),
  );

  const {
    data,
    fetchData,
    totalRecords,
    totalPages,
    sortField,
    sortDirection,
    rotation,
    handleSortChange,
    currentPage,
    rowsPerPage,
    searchValue,
    handlePageChange,
    handleRowsPerPageChange,
    handleSearch,
    isLoading,
  } = useFetchData<GetSystemConfig>({
    fetchFunction: (page, limit, sortField, sortDirection, searchValue) =>
      systemConfigService.getSystemConfigs(
        page,
        limit,
        sortField,
        sortDirection,
        searchValue,
        group,
        filters,
      ),
  });

  useEffect(() => {
    if (group) fetchData();
  }, [currentPage, rowsPerPage, sortField, sortDirection, searchValue, group]);

  const handleGroupChange = (group: string) => {
    setGroup(group);
  };

  const { handleDelete } = useTableDelete(
    {
      deleteFunction: systemConfigService.deleteSystemConfig,
      fetchData,
      onSuccess: () => {
        deleteConfirmModal.hideModal();
      },
    },
    {
      currentPage,
      rowsPerPage,
      totalRecords,
      handlePageChange,
    },
  );

  const hasChanges = useHasChanges<SystemConfigRequest>(data);

  const handleUpdateConfirm = (config: SystemConfigRequest) => {
    if (hasChanges(config, "configId")) {
      updateConfirmModal.showModal({ config });
    } else {
      formModal.hideModal();
    }
  };

  const handleCancelConfirm = (config: SystemConfigRequest, isUpdate: boolean) => {
    const hasUnsavedChanges = isUpdate
      ? hasChanges(config, "configId")
      : hasChanges(config, undefined, { isActive: false, configGroup: group });
    if (hasUnsavedChanges) {
      cancelConfirmModal.showModal();
    } else {
      formModal.hideModal();
    }
  };

  const { handleUpdate, isUpdating } = useTableUpdate<SystemConfigRequest>({
    updateService: systemConfigService.updateSystemConfig,
    fetchData: fetchData,
    onSuccess: () => {
      formModal.hideModal();
      updateConfirmModal.hideModal();
    },
    onError: () => {
      updateConfirmModal.hideModal();
    },
  });

  const { handleAdd, isAdding } = useTableAdd({
    addService: systemConfigService.createSystemConfig,
    fetchData: fetchData,
    onSuccess: () => formModal.hideModal(),
  });

  const filterContent = (
    <SystemConfigurationFilter
      filters={filters}
      updateFilters={updateFilters}
      onClear={clearFilters}
      onApply={applyFilters}
    />
  );

  return (
    <Flex className={style.container}>
      <SectionTitle title="System Configuration Management" totalRecords={totalRecords} />
      <Flex className={style.table}>
        <Table
          columns={SystemConfigurationCols}
          rows={data}
          rowKey="configKey"
          idName="configId"
          title={
            <TableTitle
              onSearch={handleSearch}
              filterContent={filterContent}
              addLabel="Add New Config"
              onAdd={() => formModal.showModal()}
              extraContent={
                <Select
                  placeholder="Select Config"
                  value={group}
                  style={{ width: "20rem" }}
                  options={groupOptions}
                  onChange={(value) => handleGroupChange(value)}
                />
              }
              sectionRightSize="small"
            />
          }
          handleSortClick={handleSortChange}
          isViewCheckbox={false}
          selectedColumn={sortField}
          rotation={rotation}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          // handleDelete={(ids) => handleDelete(ids)}
          isLoading={isLoading}
          caption="System Configuration Management Table"
          notifyNoData="No data to display"
          renderAction={(config: GetSystemConfig) => (
            <ActionMenuSystemConfig
              deletable={config.isDeleteable}
              onEdit={() => formModal.showModal(config)}
              onDelete={() => deleteConfirmModal.showModal({ id: [config.configId] })}
            />
          )}
        />

        <NavigationDot
          totalPages={totalPages}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          rowsPerPageOptions={getOptions(totalRecords)}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Flex>
      <SysConfigurationModal
        isOpen={formModal.modalState.visible}
        onClose={handleCancelConfirm}
        onSave={formModal.modalState.data ? handleUpdateConfirm : handleAdd}
        isLoadingAction={formModal.modalState.data ? isUpdating : isAdding}
        configData={formModal.modalState.data}
        groupOptions={groupOptions}
        groupCurrent={group}
      />
      {/* Confirm Delete Modal */}
      <ConfirmModal
        visible={deleteConfirmModal.modalState.visible}
        onConfirm={() => handleDelete(deleteConfirmModal.modalState.data?.id)}
        onCancel={deleteConfirmModal.hideModal}
        itemName="Configuration"
        actionType="delete"
      />
      {/* Confirm Update Modal */}
      <ConfirmModal
        visible={updateConfirmModal.modalState.visible}
        onConfirm={() => handleUpdate(updateConfirmModal.modalState.data?.config)}
        onCancel={updateConfirmModal.hideModal}
        itemName="Configuration"
        actionType="update"
      />
      {/* Confirm Cancel Modal */}
      <ConfirmModal
        visible={cancelConfirmModal.modalState.visible}
        actionType="unsaved"
        onConfirm={() => {
          cancelConfirmModal.hideModal();
          formModal.hideModal();
        }}
        onCancel={cancelConfirmModal.hideModal}
      />
    </Flex>
  );
}

export default SystemConfiguration;
