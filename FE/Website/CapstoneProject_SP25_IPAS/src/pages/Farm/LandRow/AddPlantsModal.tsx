import { Checkbox, Divider, Flex, Form, Select, Table, Typography } from "antd";
import { GetLandRow, GetPlant, PlantRequest, plantSimulate } from "@/payloads";
import { ModalForm } from "@/components";
const { Text } = Typography;
import style from "./LandRow.module.scss";
import { useEffect, useState } from "react";
import { plantService } from "@/services";

type AddPlantsModalProps = {
  rowData: GetLandRow | undefined;
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: PlantRequest) => void;
  isLoadingAction?: boolean;
};

const AddPlantsModal = ({
  rowData,
  isOpen,
  onClose,
  onSave,
  isLoadingAction,
}: AddPlantsModalProps) => {
  if (!rowData) return;
  console.log(rowData);
  const [plantList, setPlantList] = useState<GetPlant[]>([]);
  const [selectedPlants, setSelectedPlants] = useState<{ plantId: number; position?: number }[]>(
    [],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPlants, setFilteredPlants] = useState([]);

  useEffect(() => {
    const fetchPlants = async () => {
      const res = await plantService.getPlantNoPositionSelect();
      console.log(res);

      if (res.statusCode === 200) {
        setPlantList(res.data);
        // setFilteredPlants(res.data);
      }
    };
    fetchPlants();
  }, []);

  // Xử lý chọn checkbox
  const handleCheckboxChange = (plantId: number) => {
    setSelectedPlants((prev) => {
      const exists = prev.some((p) => p.plantId === plantId);
      return exists ? prev.filter((p) => p.plantId !== plantId) : [...prev, { plantId }];
    });
  };

  const handlePositionChange = (plantId: number, position: number) => {
    setSelectedPlants((prev) => prev.map((p) => (p.plantId === plantId ? { ...p, position } : p)));
  };

  // Tìm kiếm cây
  //   const handleSearch = (value: string) => {
  //     setSearchTerm(value);
  //     setFilteredPlants(plantList.filter((p) => p.name.toLowerCase().includes(value.toLowerCase())));
  //   };

  // Lấy danh sách vị trí còn trống
  const getAvailablePositions = () => {
    if (!rowData || !rowData.plants) return [];
    // Lấy danh sách vị trí đã có cây
    const occupiedPositions = rowData.plants.map((p) => p.plantIndex);
    // Tạo danh sách từ 1 đến treeAmount, lọc ra vị trí trống
    return Array.from({ length: rowData.treeAmount }, (_, i) => i + 1).filter(
      (pos) => !occupiedPositions.includes(pos),
    );
  };

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      onSave={() => {}}
      isLoading={isLoadingAction}
      title={`Add Plants (${rowData.landRowCode})`}
      saveLabel="Apply"
      size="largeXL"
    >
      <Flex vertical gap={20}>
        {/* Header hiển thị thông tin hàng */}
        <Flex gap={8} className={style.rowHeader} justify="space-between">
          <Flex gap={12} className={style.rowInfo}>
            <Text className={style.rowLabel}>Location:</Text>
            <div className={style.rowValueWrapper}>
              <Text>{`${rowData.landPlotname} (Row ${rowData.rowIndex})`}</Text>
            </div>
          </Flex>

          <Flex gap={12} className={style.rowInfo}>
            <Text className={style.rowLabel}>Plants in Row:</Text>
            <div className={style.rowValueWrapper}>
              <Text className={style.plantCount}>1 / {rowData.treeAmount}</Text>
            </div>
          </Flex>
        </Flex>

        {/* Bảng danh sách cây chưa có vị trí */}
        <Table
          dataSource={plantList}
          rowKey="plantId"
          pagination={{ pageSize: 5 }}
          columns={[
            {
              title: "Select",
              dataIndex: "select",
              render: (_, record: plantSimulate) => (
                <Checkbox
                  checked={selectedPlants.some((p) => p.plantId === record.plantId)}
                  onChange={() => handleCheckboxChange(record.plantId)}
                />
              ),
            },
            { title: "Plant Code", dataIndex: "plantCode" },
            { title: "Cultivar", dataIndex: "masterTypeName" },
            { title: "Plant Code", dataIndex: "plantCode" },
            { title: "Health Status", dataIndex: "healthStatus" },
            {
              title: "Position",
              dataIndex: "position",
              render: (_, record: plantSimulate) => (
                <Select
                  placeholder="Select Position"
                  options={getAvailablePositions().map((pos) => ({
                    label: `Position ${pos}`,
                    value: pos,
                  }))}
                  onChange={(pos) => handlePositionChange(record.plantId, pos)}
                  style={{ width: 120 }}
                />
              ),
            },
          ]}
        />
      </Flex>

      {/* <Flex justify="space-between" className={style.searchFilter}>
        <Search placeholder="Search plant..." onSearch={handleSearch} style={{ width: 200 }} />
        <Select
          placeholder="Filter by type"
          options={[
            { label: "All", value: "all" },
            { label: "Healthy", value: "healthy" },
            { label: "Unhealthy", value: "unhealthy" },
          ]}
          style={{ width: 150 }}
        />
      </Flex> */}

      {/* Hiển thị gợi ý vị trí còn trống */}
      <div className={style.availablePositions}>
        <Text strong>⚠️ Available Positions:</Text>
        <Flex wrap="wrap" gap={8} className={style.positionGrid}>
          {getAvailablePositions().map((pos) => (
            <div key={pos} className={style.gridItem}>
              ⚠️ {pos}
            </div>
          ))}
        </Flex>
      </div>
    </ModalForm>
  );
};

export default AddPlantsModal;
