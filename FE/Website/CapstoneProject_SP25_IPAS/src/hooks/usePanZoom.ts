import { useState, useRef } from "react";

interface Offset {
  x: number;
  y: number;
}

const usePanZoom = (minScale = 0.5, maxScale = 3, zoomStep = 0.1) => {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPosition = useRef({ x: 0, y: 0 });

  // Xử lý sự kiện cuộn chuột để zoom
  const handleWheel = (event: React.WheelEvent) => {
    if (event.ctrlKey) {
      event.preventDefault();
      const delta = -event.deltaY;
      const newScale = Math.min(
        Math.max(scale + (delta > 0 ? zoomStep : -zoomStep), minScale),
        maxScale,
      );
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

  return {
    scale,
    setScale,
    offset,
    setOffset,
    isPanning,
    setIsPanning,
    containerRef,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};

export default usePanZoom;
