import { landRowSimulate } from "@/payloads";

export const fakeRowsData: landRowSimulate[] = [
  // Thêm 20 hàng mới giống nhau
  ...Array.from({ length: 20 }, (_, i) => ({
    landRowId: 1 + i,
    landRowCode: "",
    length: 210,
    width: 50,
    treeAmount: 5,
    distance: 10,
    rowIndex: 1 + i,
    plants: [],
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
