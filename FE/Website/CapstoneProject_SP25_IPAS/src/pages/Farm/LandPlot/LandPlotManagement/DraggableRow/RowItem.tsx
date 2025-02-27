import { rowStateType } from "@/types";
import { Flex } from "antd";
import style from "./DraggableRow.module.scss";
import { useEffect, useRef } from "react";
import { useDrag, useDrop, XYCoord } from "react-dnd";
import { Images } from "@/assets";

const ItemTypes = {
  ROW: "ROW",
};

interface DragItem {
  index: number;
  id: number;
  type: string;
}

interface RowItemProps {
  row: rowStateType;
  rowSpacing: number;
  index: number;
  isHorizontal: boolean;
  moveRow: (dragIndex: number, hoverIndex: number) => void;
  setIsPanning: React.Dispatch<React.SetStateAction<boolean>>;
  onClick: () => void;
}

const RowItem: React.FC<RowItemProps> = ({
  row,
  rowSpacing,
  index,
  isHorizontal,
  moveRow,
  setIsPanning,
  onClick,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: string | null }>({
    accept: ItemTypes.ROW,
    collect(monitor: any) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item, monitor) {
      if (!ref.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      //Kiểm tra giới hạn hover:
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      //Quyết định khi nào thực hiện hoán đổi vị trí:
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      //Di chuyển hàng khi đủ điều kiện:
      moveRow(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.ROW,
    item: { id: row.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Lắng nghe trạng thái kéo
  useEffect(() => {
    setIsPanning(false);
  }, [isDragging]);

  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));

  return (
    <Flex justify="flex-start" ref={ref} style={{ opacity }} data-handler-id={handlerId}>
      <Flex
        className={style.row}
        vertical={!isHorizontal}
        style={{
          width: isHorizontal ? `${row.length}px` : `${row.width}px`,
          height: isHorizontal ? `${row.width}px` : `${row.length}px`,
          marginRight: `${rowSpacing}px`,
        }}
        onClick={onClick}
      >
        {Array.from({ length: row.plantsPerRow }).map((_, i) => (
          <img
            key={i}
            src={Images.plant}
            alt="Plant"
            className={style.plantImage}
            style={{
              ...(isHorizontal
                ? i !== row.plantsPerRow - 1
                  ? { marginRight: `${row.plantSpacing}px` }
                  : {}
                : i !== row.plantsPerRow - 1
                ? { marginBottom: `${row.plantSpacing}px` }
                : {}),
            }}
          />
        ))}
      </Flex>
    </Flex>
  );
};

export default RowItem;
