import moment from "moment";
import { UserRole } from "@/constants/Enum";
import { camelCase, kebabCase } from "change-case";
import { jwtDecode } from "jwt-decode";
import { DecodedToken, FileType } from "@/types";
import { HEALTH_STATUS, LOCAL_STORAGE_KEYS } from "@/constants";
import {
  cropService,
  growthStageService,
  masterTypeService,
  planService,
  processService,
  userService,
} from "@/services";
import { landRowSimulate, PlanTarget, PlanTargetModel, SelectedTarget } from "@/payloads";
import { Dayjs } from "dayjs";
import { getProcessDetail } from "@/services/ProcessService";

export const convertQueryParamsToKebabCase = (params: Record<string, any>): Record<string, any> => {
  const newParams: Record<string, any> = {};
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      newParams[kebabCase(key)] = params[key];
    }
  }
  return newParams;
};

export const convertKeysToKebabCase = (obj: any): any => {
  if (typeof obj !== "object" || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => convertKeysToKebabCase(item));
  }

  return Object.keys(obj).reduce((acc, key) => {
    const kebabKey = kebabCase(key);
    acc[kebabKey] = convertKeysToKebabCase(obj[key]);
    return acc;
  }, {} as any);
};

export const convertKeysToCamelCase = (obj: any): any => {
  if (typeof obj !== "object" || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => convertKeysToCamelCase(item));
  }

  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = camelCase(key);
    acc[camelKey] = convertKeysToCamelCase(obj[key]);
    return acc;
  }, {} as any);
};

export const hashOtp = async (input: string): Promise<string> => {
  // Chuyển OTP thành mảng byte
  const encoder = new TextEncoder();
  const data = encoder.encode(input);

  // Tạo hash SHA-256
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  // Chuyển buffer nhị phân thành Base64
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const base64String = btoa(String.fromCharCode(...hashArray));

  return base64String;
};

export const buildParams = (
  currentPage?: number,
  rowsPerPage?: number,
  sortBy?: string,
  direction?: string,
  searchValue?: string,
  additionalParams?: Record<string, any>,
): Record<string, any> => {
  const params: Record<string, any> = {
    pageIndex: currentPage,
    pageSize: rowsPerPage,
    sortBy,
    direction,
    searchKey: searchValue,
    ...additionalParams,
  };

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      params[key] = value.filter((item) => item !== undefined && item !== null).join(",");
    }
  });

  return Object.fromEntries(
    Object.entries(params).filter(
      ([_, value]) =>
        value !== undefined &&
        value !== null &&
        value !== "" &&
        (!Array.isArray(value) || value.length > 0) &&
        (typeof value !== "object" || Object.keys(value).length > 0),
    ),
  );
};

export const isValidBreadcrumb = (path: string) => {
  const hasNumberAndSpecialChar = /\d/.test(path) && /[^a-zA-Z0-9]/.test(path);
  const hasNumberAndLetter = /[a-zA-Z]/.test(path) && /\d/.test(path);
  const isNumberOnly = /^\d+$/.test(path);

  return isNumberOnly || hasNumberAndSpecialChar || hasNumberAndLetter;
};

export const generateRandomKey = (): string => {
  return `${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;
};

export const getOptions = (total: number): number[] => {
  if (total > 50) return [5, 10, 20, 50, 100];
  if (total > 20) return [5, 10, 20, 50];
  if (total > 10) return [5, 10, 20];
  if (total > 5) return [5, 10];
  return [5];
};

export const getCriteriaOptions = (total: number): number[] => {
  if (total > 50) return [3, 10, 20, 50, 100];
  if (total > 20) return [3, 10, 20, 50];
  if (total > 10) return [3, 10, 20];
  if (total > 5) return [3, 10];
  return [3];
};

export const formatCurrencyVND = (amount: string): string => {
  const number = parseFloat(amount.replace(/,/g, ""));
  if (isNaN(number)) {
    return amount;
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  })
    .format(number)
    .replace("₫", "VND")
    .trim();
};

export const formatCurrency = (amount: string): string => {
  const number = parseFloat(amount.replace(/,/g, ""));
  if (isNaN(number)) {
    return amount;
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  })
    .format(number)
    .trim();
};

export const DATE_FORMAT = "DD/MM/YYYY";

export const getCurrentDate = (): string => {
  return moment().format("dddd, DD/MM/YYYY");
};

export const formatDate = (date: Date | string): string => {
  return moment(date).format("DD/MM/YYYY");
};

export const formatDateAndTime = (date: Date): string => {
  return moment(date).format("DD/MM/YYYY HH:mm:ss");
};

export const formatDayMonthAndTime = (date: Date): string => {
  return moment(date).format("dddd, Do MMMM YYYY, h:mm A");
};

export const formatDayMonth = (date: Date | string): string => {
  return moment(date).format("dddd, Do MMMM YYYY");
};

export const formatDateRange = (startDate: string | Date, endDate?: string | Date): string => {
  const start = moment(startDate);
  const end = endDate ? moment(endDate) : null;

  if (!end) {
    return `(${start.format("DD/MM/YYYY HH:mm:ss")})`;
  }

  if (start.isSame(end, "day")) {
    return `(${start.format("DD/MM/YYYY HH:mm:ss")} - ${end.format("HH:mm:ss")})`;
  }

  return `(${start.format("DD/MM/YYYY HH:mm:ss")} - ${end.format("DD/MM/YYYY HH:mm:ss")})`;
};
export const getRoleId = (): string => {
  const accessToken = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
  if (!accessToken) return "";
  return jwtDecode<DecodedToken>(accessToken).roleId;
};

export const getUserId = (): string => {
  const accessToken = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
  if (!accessToken) return "";
  return jwtDecode<DecodedToken>(accessToken).UserId;
};

export const getUserInfoById = (userId: number) => {
  const user = userService.getUserById(userId);
  return user;
}

export const getFarmId = (): string => {
  const accessToken = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
  if (!accessToken) return "";
  return jwtDecode<DecodedToken>(accessToken).farmId;
};

export const getRoleName = (): string => {
  const roleId = Number(getRoleId());
  if (roleId === UserRole.Admin) {
    return "Administrator";
  } else if (roleId === UserRole.User) {
    return "User";
  } else if (roleId === UserRole.Owner) {
    return "Farm Owner";
  } else if (roleId === UserRole.Manager) {
    return "Farm Manager";
  } else if (roleId === UserRole.Employee) {
    return "Farm Employee";
  }
  return UserRole[roleId] ? `Role: ${UserRole[roleId]}` : "undefined";
};

export const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

export const addOneMonthToDate = (date: Date): string => {
  const currentDate = new Date(date);
  currentDate.setMonth(currentDate.getMonth() + 1);
  return currentDate.toLocaleDateString("vi-VN");
};

export const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export const fetchUserByRole = async (role: string) => {
  const users = await userService.getUsersByRole(role);
  return users.map((user) => ({
    value: user.fullName,
    label: user.fullName,
  }));
};

export const fetchUserInfoByRole = async (role: string) => {
  const users = await userService.getUsersByRole(role);
  return users.map((user) => ({
    fullName: user.fullName,
    avatarURL: user.avatarURL,
    userId: user.userId,
  }));
};

export const fetchCropOptions = async (farmId: string) => {
  const crops = await cropService.getCropsOfFarmForSelect(farmId);
  return crops.map((crop) => ({
    value: crop.cropId,
    label: crop.cropName,
  }));
};

export const fetchGrowthStageOptions = async (farmId: number) => {
  const growthStages = await growthStageService.getGrowthStagesOfFarmForSelect(farmId);

  return growthStages.map((growthStage: { id: number; name: string }) => ({
    value: growthStage.id,
    label: growthStage.name,
  }));
};

export const frequencyOptions = [
  { value: "None", label: "None" },
  { value: "Daily", label: "Daily" },
  { value: "Weekly", label: "Weekly" },
  { value: "Monthly", label: "Monthly" },
];

export const activeOptions = [
  { label: "Active", value: true },
  { label: "Inactive", value: false },
];

export const statusOptions = [
  { label: "Pending", value: "pending" },
  { label: "In Progress", value: "inProgress" },
  { label: "Completed", value: "completed" },
];

export const unitOptions = [
  { label: "Land Plot", value: "landplot" },
  { label: "Row", value: "row" },
  { label: "Plant", value: "plant" },
  // { label: "Plant Lot", value: "plantlot" },
  // { label: "Grafted Plant", value: "graftedplant" },
];

export const worklogStatusOptions = [
  { label: "Not Started", value: "Not Started" },
  { label: "In Progress", value: "In Progress" },
  { label: "Overdue", value: "Overdue" },
  { label: "Reviewing", value: "Reviewing" },
  { label: "Redo", value: "Redo" },
  { label: "Done", value: "Done" },
  { label: "On Redo", value: "On Redo" },
];

export const planTargetOptions = [
  { label: "Land Plot/ Land Row/ Plant", value: "regular" },
  { label: "Plant Lot", value: "plantLot" },
  { label: "Grafted Plant", value: "graftedPlant" }
];

export const planTargetOptions2 = [
  { label: "Land Plot/ Land Row/ Plant", value: 1 },
  { label: "Plant Lot", value: 2 },
  { label: "Grafted Plant", value: 3 }
];

export const fetchTypeOptionsByName = async (typeName: string) => {
  const types = await masterTypeService.getTypeByName(typeName);

  return types.map((type) => ({
    value: type.masterTypeId,
    label: type.masterTypeName,
  }));
};

export const fetchProcessesOfFarm = async (farmId: number, isSample?: boolean) => {
  const processFarms = await processService.getProcessesOfFarmForSelect(farmId, isSample);
  return processFarms.map((processFarm) => ({
    value: processFarm.processId,
    label: processFarm.processName,
  }));
};

export const generatePlanId = (existingIds: number[] = []) => {
  const min = 1;
  const max = 2147483647;

  let newId;
  do {
    newId = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (existingIds.includes(newId));

  return newId;
};

export const isPlantOverflowing = (
  plantSpacing: number,
  plantsPerRow: number,
  rowLength: number,
): boolean => {
  const totalPlantSpace = (Number(plantSpacing) + 24) * Number(plantsPerRow);
  return totalPlantSpace > rowLength;
};

// export const normalizeRow = (row: landRowSimulate | rowStateType) => ({
//   rowId: "landRowId" in row ? row.landRowId : row.id,
//   rowCode: "landRowCode" in row ? row.landRowCode : "", // Nếu không có thì gán chuỗi rỗng
//   length: row.length,
//   width: row.width,
//   treeAmount: "treeAmount" in row ? row.treeAmount : row.plantsPerRow,
//   distance: "distance" in row ? row.distance : row.plantSpacing,
//   plants:
//     "plants" in row
//       ? row.plants.map((plant) => ({
//           plantId: plant.plantId,
//           plantCode: plant.plantCode,
//           plantIndex: plant.plantIndex,
//           healthStatus: plant.healthStatus ?? HEALTH_STATUS.HEALTHY,
//         }))
//       : Array.from({ length: row.plantsPerRow }).map((_, i) => ({
//           id: i,
//           healthStatus: HEALTH_STATUS.HEALTHY,
//         })),
//   rowIndex: "rowIndex" in row ? row.rowIndex : row.index,
// });

export const formatDateW = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };

  const day = date.getDate();
  const suffix = getDaySuffix(day);

  const formattedDate = new Intl.DateTimeFormat("en-US", options).format(date);
  return formattedDate.replace(/\d+/, `${day}${suffix}`);
};

const getDaySuffix = (day: number): string => {
  if (day >= 11 && day <= 13) return "th";
  const lastDigit = day % 10;
  switch (lastDigit) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

export const isDayInRange = (
  day: number,
  startDate: Dayjs,
  endDate: Dayjs,
  type: "weekly" | "monthly",
) => {
  if (type === "weekly") {
    let currentDate = startDate.clone();
    while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, "day")) {
      if (currentDate.day() === day) {
        return true;
      }
      currentDate = currentDate.add(1, "day");
    }
    return false;
  } else if (type === "monthly") {
    const targetDate = startDate.date(day);
    return targetDate.isBetween(startDate, endDate, "day", "[]");
  }
  return false;
};

export const getGrowthStageOfProcess = async (processId: number): Promise<number | undefined> => {
  const res = await getProcessDetail(processId);
  
  return res.processGrowthStageModel?.growthStageId;
};

export const getTypeOfProcess = async (processId: number): Promise<number> => {
  const res = await getProcessDetail(processId);
  return res.processMasterTypeModel.masterTypeId;
}

// export const isTargetOverlapping = (
//   index: number,
//   newLandPlotId: number | undefined,
//   newLandRows: number | number[],
//   newPlants: number[],
//   newUnit: string | undefined,
//   selectedUnits: (string | undefined)[],
//   selectedLandPlots: (number | undefined)[],
//   selectedLandRows: number[][],
//   selectedPlants: number[][],
// ) => {
//   const newLandRowsArray = Array.isArray(newLandRows) ? newLandRows : [newLandRows];

//   for (let i = 0; i < selectedLandPlots.length; i++) {
//     if (i === index) continue;

//     const existingUnit = selectedUnits[i];
//     const existingLandPlot = selectedLandPlots[i];
//     const existingLandRows = selectedLandRows[i];
//     const existingPlants = selectedPlants[i];

//     if (
//       newUnit === existingUnit ||
//       (newUnit === "row" && existingUnit === "landplot") ||
//       (newUnit === "plant" && existingUnit === "row")
//     ) {
//       if (newLandPlotId === existingLandPlot) {
//         if (newLandRowsArray.length > 0 && existingLandRows.length > 0) {
//           const isRowOverlapping = newLandRowsArray.some((row) => existingLandRows.includes(row));
//           if (isRowOverlapping) {
//             if (newPlants.length > 0 && existingPlants.length > 0) {
//               const isPlantOverlapping = newPlants.some((plant) => existingPlants.includes(plant));
//               if (isPlantOverlapping) {
//                 return true;
//               }
//             }
//             return true;
//           }
//         }
//         return true;
//       }
//     }
//   }
//   return false;
// };

export const isTargetOverlapping = (
  index: number,
  newLandPlotId: number | undefined,
  newLandRows: number | number[],
  newPlants: number[],
  newUnit: string | undefined,
  selectedUnits: (string | undefined)[],
  selectedLandPlots: (number | undefined)[],
  selectedLandRows: number[][],
  selectedPlants: number[][],
) => {
  const newLandRowsArray = Array.isArray(newLandRows) ? newLandRows : [newLandRows];

  for (let i = 0; i < selectedLandPlots.length; i++) {
    if (i === index) continue;

    const existingUnit = selectedUnits[i];
    const existingLandPlot = selectedLandPlots[i];
    const existingLandRows = selectedLandRows[i];
    const existingPlants = selectedPlants[i];

    // Kiểm tra trùng lặp khi newUnit và existingUnit là plot
    if (newUnit === "landplot" && existingUnit === "landplot") {
      if (newLandPlotId === existingLandPlot) {
        return true; // Trùng lặp vì cùng landplot
      }
    }

    // Kiểm tra trùng lặp khi newUnit là row và existingUnit là landplot
    if (newUnit === "row" && existingUnit === "landplot") {
      if (newLandPlotId === existingLandPlot) {
        return true; // Trùng lặp vì row nằm trong landplot
      }
    }

    // Kiểm tra trùng lặp khi newUnit là plant và existingUnit là landplot
    if (newUnit === "plant" && existingUnit === "landplot") {
      if (newLandPlotId === existingLandPlot) {
        return true; // Trùng lặp vì plant nằm trong landplot
      }
    }

    // Kiểm tra trùng lặp khi newUnit là row và existingUnit là row
    if (newUnit === "row" && existingUnit === "row") {
      if (newLandPlotId === existingLandPlot) {
        const isRowOverlapping = newLandRowsArray.some((row) => existingLandRows.includes(row));
        if (isRowOverlapping) {
          return true; // Trùng lặp vì cùng landplot và landrow
        }
      }
    }

    // Kiểm tra trùng lặp khi newUnit là plant và existingUnit là row
    if (newUnit === "plant" && existingUnit === "row") {
      if (newLandPlotId === existingLandPlot) {
        const isRowOverlapping = newLandRowsArray.some((row) => existingLandRows.includes(row));
        if (isRowOverlapping) {
          return true; // Trùng lặp vì plant nằm trong row
        }
      }
    }

    // Kiểm tra trùng lặp khi newUnit là plant và existingUnit là plant
    if (newUnit === "plant" && existingUnit === "plant") {
      if (newLandPlotId === existingLandPlot) {
        const isRowOverlapping = newLandRowsArray.some((row) => existingLandRows.includes(row));
        if (isRowOverlapping) {
          const isPlantOverlapping = newPlants.some((plant) => existingPlants.includes(plant));
          if (isPlantOverlapping) {
            return true; // Trùng lặp vì cùng landplot, landrow, và plant
          }
        }
      }
    }
  }
  return false;
};
export const fetchTargetsByUnit = async (
  unit: string,
  selectedGrowthStage: number[],
  index: number,
  setSelectedTargets: React.Dispatch<React.SetStateAction<SelectedTarget[][]>>,
) => {
  try {
    const response = await planService.filterTargetByUnitGrowthStage(
      unit,
      selectedGrowthStage,
      Number(getFarmId()),
    );
    console.log("res trong fetchTargetsByUnit", response);
    

    const formattedData = response.map((item) => ({
      unit,
      landPlotId: item.landPlotId ?? null,
      landPlotName: item.landPlotName ?? "",
      rows:
        unit === "row" || unit === "plant"
          ? item.rows.map((row) => ({
              landRowId: row.landRowId,
              rowIndex: row.rowIndex,
              plants: row.plants.map((plant) => ({
                plantId: plant.plantId,
                plantName: plant.plantName,
              })),
            }))
          : [],
      plants:
        unit === "plant"
          ? item.plants.map((plant) => ({
              plantId: plant.plantId,
              plantName: plant.plantName,
            }))
          : [],
      plantLots:
        unit === "plantlot"
          ? item.plantLots.map((lot) => ({
              plantLotId: lot.plantLotId,
              plantLotName: lot.plantLotName,
            }))
          : [],
      graftedPlants:
        unit === "graftedplant"
          ? item.graftedPlants.map((grafted) => ({
              graftedPlantId: grafted.graftedPlantId,
              graftedPlantName: grafted.graftedPlantName,
            }))
          : [],
    }));
    console.log("formattedData trong fetchTargetsByUnit", formattedData);
    

    setSelectedTargets((prev) => {
      const newSelectedTargets = [...prev];
      newSelectedTargets[index] = formattedData;
      console.log("sau khi setSelectedTargets", newSelectedTargets);
      return newSelectedTargets;
    });
    console.log("hình như k chạy đến đây");
    
    
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const fetchPlantLotsByUnitAndGrowthStage = async (
  unit: string,
  selectedGrowthStage: number[],
  farmId: number,
) => {
  try {
    const response = await planService.filterTargetByUnitGrowthStage(
      unit,
      selectedGrowthStage,
      farmId,
    );
    console.log("filter lot", response);
    

    const formattedData = response.flatMap((item) =>
      item.plantLots.map((lot) => ({
        value: lot.plantLotId,
        label: `${item.landPlotName} - ${lot.plantLotName}`,
      }))
    );

    return formattedData;
  } catch (error) {
    console.error("Error fetching plant lots:", error);
    throw error;
  }
};

export const determineUnit = (target: any): string => {
  if (target.graftedPlants && target.graftedPlants.length > 0) {
      return "graftedplant";
  }
  if (target.plantLots && target.plantLots.length > 0) {
      return "plantlot";
  }
  if (target.plants && target.plants.length > 0) {
      return "plant";
  }
  if (target.rows && target.rows.length > 0) {
      return "row";
  }
  if (target.landPlotId) {
      return "landplot";
  }
  return "";
};

export const transformPlanTargetData = (planTargetModels: PlanTargetModel[]): PlanTarget[] => {
        return planTargetModels.flatMap((model) => {
            const { rows, landPlotName, graftedPlants, plantLots, plants } = model;
            const unit = determineUnit(model);
            const data: PlanTarget[] = [];
    
            switch (unit) {
                case "Row":
                    if (rows && rows.length > 0) {
                        const rowNames = rows.map((row) => `Row ${row.rowIndex}`);
                        const plantNames = rows.flatMap((row) => row.plants.map((plant) => plant.plantName));
                        data.push({
                            type: "Row",
                            plotNames: landPlotName ? [landPlotName] : undefined,
                            rowNames: rowNames.length > 0 ? rowNames : undefined,
                            plantNames: plantNames.length > 0 ? plantNames : undefined,
                        });
                    }
                    break;
    
                case "Plant":
                    if (plants && plants.length > 0) {
                        data.push({
                            type: "Plant",
                            plotNames: landPlotName ? [landPlotName] : undefined,
                            plantNames: plants.map((plant) => plant.plantName),
                        });
                    }
                    break;
    
                case "Grafted Plant":
                    if (graftedPlants && graftedPlants.length > 0) {
                        data.push({
                            type: "Grafted Plant",
                            plotNames: landPlotName ? [landPlotName] : undefined,
                            graftedPlantNames: graftedPlants.map((plant) => plant.name),
                        });
                    }
                    break;
    
                case "Plant Lot":
                    if (plantLots && plantLots.length > 0) {
                        data.push({
                            type: "Plant Lot",
                            plotNames: landPlotName ? [landPlotName] : undefined,
                            plantLotNames: plantLots.map((lot) => lot.name),
                        });
                    }
                    break;
    
                case "Plot":
                    if (landPlotName) {
                        data.push({
                            type: "Plot",
                            plotNames: [landPlotName],
                        });
                    }
                    break;
    
                default:
                    break;
            }
    
            return data;
        });
    };
