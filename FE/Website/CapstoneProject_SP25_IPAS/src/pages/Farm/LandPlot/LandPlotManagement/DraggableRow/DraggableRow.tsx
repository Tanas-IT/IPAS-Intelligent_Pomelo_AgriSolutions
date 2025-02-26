import React, { useCallback, useRef, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Flex, FormInstance } from "antd";
import style from "./DraggableRow.module.scss";
import { Icons } from "@/assets";
import { rowStateType } from "@/types";
import RowItem from "./RowItem";
import { ConfirmModal, CustomButton, MapControls } from "@/components";
import RowItemModal from "./RowItemModal";
import { useHasChanges, useModal } from "@/hooks";
import { createPlotFormFields } from "@/constants";

interface DraggableRowProps {
  rowsData: rowStateType[];
  setRowsData: React.Dispatch<React.SetStateAction<rowStateType[]>>;
  form: FormInstance;
  isHorizontal: boolean;
  rowSpacing: number;
  rowsPerLine: number;
  lineSpacing: number;
}

const DraggableRow: React.FC<DraggableRowProps> = ({
  rowsData,
  setRowsData,
  form,
  isHorizontal,
  rowSpacing,
  rowsPerLine,
  lineSpacing,
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
          index: index + 1,
        }));
      });
    },
    [setRowsData],
  );

  const renderRows = () => {
    const groupedRows = [];
    for (let i = 0; i < rowsData.length; i += rowsPerLine) {
      groupedRows.push(
        <Flex key={i} style={{ marginBottom: `${lineSpacing}px` }} justify="flex-start">
          {rowsData.slice(i, i + rowsPerLine).map((row, index) => (
            <RowItem
              key={row.id}
              rowSpacing={rowSpacing}
              row={row}
              index={i + index}
              isHorizontal={isHorizontal}
              moveRow={moveRow}
              setIsPanning={setIsPanning}
            />
          ))}
        </Flex>,
      );
    }
    return groupedRows;
  };

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 }); // Tọa độ kéo
  const [isPanning, setIsPanning] = useState(false); // Trạng thái kéo
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPosition = useRef({ x: 0, y: 0 });

  // Xử lý sự kiện cuộn chuột để zoom
  const handleWheel = (event: React.WheelEvent) => {
    if (event.ctrlKey) {
      event.preventDefault();
      const delta = -event.deltaY;
      const zoomStep = 0.1;
      const newScale = Math.min(Math.max(scale + (delta > 0 ? zoomStep : -zoomStep), 0.5), 3);
      setScale(newScale);
    }
  };

  // Bắt đầu kéo
  const handleMouseDown = (event: React.MouseEvent) => {
    setIsPanning(true);
    lastPosition.current = { x: event.clientX, y: event.clientY };
  };

  // Di chuyển trong khi kéo
  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isPanning) return;

    const dx = event.clientX - lastPosition.current.x;
    const dy = event.clientY - lastPosition.current.y;

    setOffset((prev) => ({
      x: prev.x + dx,
      y: prev.y + dy,
    }));

    lastPosition.current = { x: event.clientX, y: event.clientY };
  };

  // Kết thúc kéo
  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const formModal = useModal<rowStateType>();
  const cancelConfirmModal = useModal();

  const hasChanges = useHasChanges<rowStateType>(rowsData);

  const handleCancelConfirm = (row: rowStateType, isUpdate: boolean) => {
    const hasUnsavedChanges = isUpdate ? hasChanges(row, "id") : hasChanges(row);

    if (hasUnsavedChanges) {
      cancelConfirmModal.showModal();
    } else {
      formModal.hideModal();
    }
  };

  const handleAdd = (newRow: Omit<rowStateType, "id" | "index">) => {
    console.log(newRow);
    
    setRowsData((prevRows) => {
      const lastRow = prevRows[prevRows.length - 1];
      const nextIndex = lastRow ? lastRow.index + 1 : 1;
      const nextId = lastRow ? lastRow.id + 1 : 1;

      const updatedRow: rowStateType = {
        id: nextId,
        index: nextIndex,
        length: Number(newRow.length),
        width: Number(newRow.width),
        plantsPerRow: Number(newRow.plantsPerRow),
        plantSpacing: Number(newRow.plantSpacing),
      };
      console.log(updatedRow);

      const currentNumberOfRows = form.getFieldValue(createPlotFormFields.numberOfRows) || 0;
      form.setFieldValue(createPlotFormFields.numberOfRows, currentNumberOfRows + 1);
      formModal.hideModal();
      return [...prevRows, updatedRow];
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div ref={containerRef}>
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
            {renderRows()}
          </div>
        </Flex>
        <RowItemModal
          isOpen={formModal.modalState.visible}
          onClose={handleCancelConfirm}
          // onSave={formModal.modalState.data ? {} : handleAdd}
          onSave={handleAdd}
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
      </div>
    </DndProvider>
  );
};

export default DraggableRow;
