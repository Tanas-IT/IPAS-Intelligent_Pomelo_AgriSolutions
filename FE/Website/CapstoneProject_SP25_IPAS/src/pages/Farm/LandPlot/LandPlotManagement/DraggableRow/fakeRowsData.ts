import { rowStateType } from "@/types";

export const fakeRowsData: rowStateType[] = [
  // Thêm 20 hàng mới giống nhau
  ...Array.from({ length: 20 }, (_, i) => ({
    id: 1 + i,
    length: 210,
    width: 50,
    plantsPerRow: 5,
    plantSpacing: 10,
    index: 1 + i,
  })),
  // {
  //   id: 20,
  //   length: 210,
  //   width: 50,
  //   plantsPerRow: 8,
  //   plantSpacing: 10,
  //   index: 20,
  // },
];
