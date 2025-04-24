import React, { useCallback } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Divider, Flex } from "antd";
import style from "./DraggableRow.module.scss";
import { Icons } from "@/assets";
import { ConfirmModal, CustomButton, MapControls, RowList } from "@/components";
import RowItemModal from "./RowItemModal";
import { useHasChanges, useModal, usePanZoom } from "@/hooks";
import { isPlantOverflowing } from "@/utils";
import { landRowSimulate } from "@/payloads";
import { toast } from "react-toastify";
import { MESSAGES } from "@/constants";

interface DraggableRowProps {
  rowsData: landRowSimulate[];
  setRowsData: React.Dispatch<React.SetStateAction<landRowSimulate[]>>;
  isHorizontal: boolean;
  rowsPerLine: number;
}

const DraggableRow: React.FC<DraggableRowProps> = ({
  rowsData,
  setRowsData,
  isHorizontal,
  rowsPerLine,
}) => {
  const moveRow = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      setRowsData((prevRows) => {
        const updatedRows = [...prevRows]; // Tạo bản sao của mảng

        // Hoán đổi hai phần tử
        [updatedRows[dragIndex], updatedRows[hoverIndex]] = [
          updatedRows[hoverIndex],
          updatedRows[dragIndex],
        ];

        // Re-index lại để giữ đúng thứ tự khi kéo dọc
        return updatedRows.map((row, index) => ({
          ...row,
          rowIndex: index + 1,
          index: index + 1,
        }));
      });
    },
    [setRowsData],
  );

  const {
    scale,
    setScale,
    offset,
    isPanning,
    setIsPanning,
    containerRef,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = usePanZoom();

  const formModal = useModal<landRowSimulate>();
  const updateConfirmModal = useModal<{ row: landRowSimulate }>();
  const cancelConfirmModal = useModal();

  const hasChanges = useHasChanges<landRowSimulate>(rowsData);

  const handleCancelConfirm = (row: landRowSimulate, isUpdate: boolean) => {
    const hasUnsavedChanges = isUpdate
      ? hasChanges(row, "landRowId", {}, ["landRowCode"])
      : hasChanges(row);

    if (hasUnsavedChanges) {
      cancelConfirmModal.showModal();
    } else {
      formModal.hideModal();
    }
  };

  const handleAdd = (newRow: Omit<landRowSimulate, "landRowId" | "rowIndex">) => {
    // if (isPlantOverflowing(newRow.distance, newRow.treeAmount, newRow.length)) {
    //   toast.error(MESSAGES.OUT_PLANT);
    //   return;
    // }

    setRowsData((prevRows) => {
      const lastRow = prevRows[prevRows.length - 1];
      const nextIndex = lastRow ? lastRow.rowIndex + 1 : 1;
      // const nextId = lastRow ? lastRow.landRowId + 1 : 1;

      const updatedRow: landRowSimulate = {
        // landRowId: nextId,
        landRowCode: "",
        rowIndex: nextIndex,
        length: Number(newRow.length),
        width: Number(newRow.width),
        treeAmount: Number(newRow.treeAmount),
        distance: Number(newRow.distance),
        plants: [],
      };

      formModal.hideModal();
      return [...prevRows, updatedRow];
    });
  };

  const handleUpdateConfirm = (row: landRowSimulate) => {
    if (hasChanges(row, "landRowId")) {
      updateConfirmModal.showModal({ row });
    } else {
      formModal.hideModal();
    }
  };

  const handleUpdate = (updatedRow?: landRowSimulate) => {
    if (!updatedRow) return;
    // if (isPlantOverflowing(updatedRow.distance, updatedRow.treeAmount, updatedRow.length)) {
    //   updateConfirmModal.hideModal();
    //   toast.error(MESSAGES.OUT_PLANT);
    //   return;
    // }
    try {
      if (updatedRow.indexUsed && Number(updatedRow.treeAmount) < updatedRow.indexUsed) {
        toast.error(
          `Cannot update the plant amount. The number of plants must be at least ${updatedRow.indexUsed} which have already been added.`,
        );
        return;
      }
      setRowsData((prevRows) =>
        prevRows.map((row) =>
          row.landRowId === updatedRow.landRowId
            ? {
                ...row,
                length: Number(updatedRow.length),
                width: Number(updatedRow.width),
                treeAmount: Number(updatedRow.treeAmount),
                distance: Number(updatedRow.distance),
              }
            : row,
        ),
      );
      formModal.hideModal();
    } finally {
      updateConfirmModal.hideModal();
    }
  };

  const handleDeleteRow = (landRowId: number, indexUsed: number) => {
    if (indexUsed > 0) {
      toast.error(MESSAGES.CANNOT_DELETE_ROW);
      return;
    }
    setRowsData((prev) => {
      const updatedRows = prev.filter((r) => r.landRowId !== landRowId); // Lọc ra hàng đã xóa
      // Cập nhật lại index của các hàng còn lại
      return updatedRows.map((r, index) => ({
        ...r,
        rowIndex: index + 1, // Cập nhật lại rowIndex, bắt đầu từ 1
      }));
    });
    formModal.hideModal();
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div ref={containerRef}>
        <Flex className={style.rowHeader}>
          <Flex className={style.rowInfoContainer}>
            <span className={style.totalRowsLabel}>
              Total Rows: {rowsData.length} 
              {/* — Total Area: {100} m² */}
            </span>
            <Divider className={style.divider} />
            <span className={style.rowOrientationLabel}>
              Orientation: {isHorizontal ? "Horizontal" : "Vertical"}
            </span>
          </Flex>

          {/* Nút Zoom In/Out */}
          <Flex className={style.zoomControls}>
            <CustomButton
              label={"Add New Row"}
              icon={<Icons.plus />}
              handleOnClick={() => formModal.showModal()}
            />
            <MapControls
              icon={<Icons.zoomIn />}
              label="Zoom In"
              onClick={() => setScale((prev) => Math.min(prev + 0.1, 2))}
            />
            <MapControls
              icon={<Icons.zoomOut />}
              label=" Zoom Out"
              onClick={() => setScale((prev) => Math.max(prev - 0.1, 0.5))}
            />
          </Flex>
        </Flex>

        <Flex
          className={style.draggableRowContainer}
          style={{
            cursor: isPanning ? "grabbing" : "grab",
          }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              transformOrigin: "center",
              transition: isPanning ? "none" : "transform 0.1s ease-out",
              width: "fit-content",
            }}
          >
            <RowList
              rowsData={rowsData}
              rowsPerLine={rowsPerLine}
              isHorizontal={isHorizontal}
              moveRow={moveRow}
              setIsPanning={setIsPanning}
              onRowClick={(row) => formModal.showModal(row)}
              // onRowClick={handleRowClick}
              // onRowClick={handleRowAction}
            />
          </div>
        </Flex>
        <RowItemModal
          isOpen={formModal.modalState.visible}
          onClose={handleCancelConfirm}
          onSave={formModal.modalState.data ? handleUpdateConfirm : handleAdd}
          // onSave={handleAdd}
          onDelete={handleDeleteRow}
          rowData={formModal.modalState.data}
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
        {/* Confirm Update Modal */}
        <ConfirmModal
          visible={updateConfirmModal.modalState.visible}
          onConfirm={() => handleUpdate(updateConfirmModal.modalState.data?.row)}
          onCancel={updateConfirmModal.hideModal}
          itemName="Stage"
          actionType="update"
        />
      </div>
    </DndProvider>
  );
};

export default DraggableRow;
