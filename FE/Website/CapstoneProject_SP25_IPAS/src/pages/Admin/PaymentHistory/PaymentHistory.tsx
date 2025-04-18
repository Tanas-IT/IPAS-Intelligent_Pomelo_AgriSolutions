import { useFetchData, useFilters } from "@/hooks";
import style from "./PaymentHistory.module.scss";
import { GetPaymentHistory } from "@/payloads";
import { paymentService } from "@/services";
import { useEffect } from "react";
import { DEFAULT_PAYMENT_HISTORY_FILTERS, getOptions } from "@/utils";
import { Flex } from "antd";
import { NavigationDot, SectionTitle, Table, TableTitle } from "@/components";
import { PaymentHistoryCols } from "./PaymentHistoryCols";
import { FilterPaymentHistoryState } from "@/types";
import PaymentHistoryFilter from "./PaymentHistoryFilter";

function PaymentHistory() {
  const { filters, updateFilters, applyFilters, clearFilters } =
    useFilters<FilterPaymentHistoryState>(DEFAULT_PAYMENT_HISTORY_FILTERS, () => fetchData(1));

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
  } = useFetchData<GetPaymentHistory>({
    fetchFunction: (page, limit, sortField, sortDirection, searchValue) =>
      paymentService.getPaymentHistory(page, limit, sortField, sortDirection, searchValue, filters),
  });

  useEffect(() => {
    fetchData();
  }, [currentPage, rowsPerPage, sortField, sortDirection, searchValue]);

  const filterContent = (
    <PaymentHistoryFilter
      filters={filters}
      updateFilters={updateFilters}
      onClear={clearFilters}
      onApply={applyFilters}
    />
  );

  return (
    <Flex className={style.container}>
      <SectionTitle title="Payment History Management" totalRecords={totalRecords} />
      <Flex className={style.table}>
        <Table
          columns={PaymentHistoryCols}
          rows={data}
          rowKey="orderCode"
          idName="orderId"
          title={<TableTitle onSearch={handleSearch} filterContent={filterContent} noAdd />}
          handleSortClick={handleSortChange}
          selectedColumn={sortField}
          sortDirection={sortDirection}
          rotation={rotation}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          isViewCheckbox={false}
          isLoading={isLoading}
          caption="Payment History Management Board"
          notifyNoData="No payments to display"
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
    </Flex>
  );
}

export default PaymentHistory;
