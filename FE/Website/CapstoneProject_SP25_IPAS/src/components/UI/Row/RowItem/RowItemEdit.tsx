import { Flex } from "antd";
import { useEffect, useRef } from "react";
import { useDrag, useDrop, XYCoord } from "react-dnd";
import style from "./RowItem.module.scss";
import { Images } from "@/assets";
import { landRowSimulate } from "@/payloads";

const ItemTypes = {
  ROW: "ROW",
};

interface DragItem {
  index: number;
  id: number;
  type: string;
}

interface RowItemEditProps {
  row: landRowSimulate;
  rowSpacing: number;
  index: number;
  isHorizontal: boolean;
  moveRow?: (dragIndex: number, hoverIndex: number) => void;
  setIsPanning?: React.Dispatch<React.SetStateAction<boolean>>;
  onClick?: () => void;
}

const RowItemEdit: React.FC<RowItemEditProps> = ({
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
      if (!ref.current || !moveRow) return;

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
    item: { id: row.landRowId, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Lắng nghe trạng thái kéo
  useEffect(() => {
    if (setIsPanning) setIsPanning(false);
  }, [isDragging]);

  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));

  return (
    <Flex
      justify="flex-start"
      ref={ref}
      style={{ opacity }}
      data-handler-id={handlerId}
      className={style.rowContainer}
    >
      <Flex
        className={style.row}
        vertical={!isHorizontal}
        style={{
          width: isHorizontal ? `${row.length}px` : `${row.width}px`,
          height: isHorizontal ? `${row.width}px` : `${row.length}px`,
          marginRight: `${rowSpacing}px`,
          cursor: "grab",
        }}
        onClick={onClick}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {Array.from({ length: row.treeAmount }).map((_, i) => (
          <img
            key={i}
            src={Images.plant2}
            alt="Plant"
            className={style.plantImage}
            style={{
              ...(isHorizontal
                ? i !== row.treeAmount - 1
                  ? { marginRight: `${row.distance}px` }
                  : {}
                : i !== row.treeAmount - 1
                ? { marginBottom: `${row.distance}px` }
                : {}),
            }}
          />
        ))}
      </Flex>
    </Flex>
  );
};

export default RowItemEdit;
