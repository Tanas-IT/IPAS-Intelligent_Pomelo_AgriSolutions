import { useSidebarStore } from "@/stores";
import { useEffect } from "react";

const BREAKPOINT = 1400;

const useResponsive = () => {
  const setSidebarState = useSidebarStore((state) => state.setSidebarState);
  const setCanExpand = useSidebarStore((state) => state.setCanExpand);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      // console.log(`[useResponsive] Current width: ${width}px`); // ✅ Log ra màn hình hiện tại
      if (width < BREAKPOINT) {
        setSidebarState(false); // Thu sidebar lại
        setCanExpand(false); // Không cho expand
      } else {
        setSidebarState(true); // Mở sidebar
        setCanExpand(true); // Cho phép expand
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // ✅ Gọi lần đầu tiên luôn

    return () => window.removeEventListener("resize", handleResize);
  }, [setSidebarState, setCanExpand]);
};
export default useResponsive;
