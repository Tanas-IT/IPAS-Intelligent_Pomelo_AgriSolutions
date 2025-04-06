import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { PlantDetailRouteProp } from "@/constants/Types";
import { useRoute } from "@react-navigation/native";
import { PlantDetailData } from "@/types/plant";
import PlantHeader from "./components/PlantHeader";
import BasicInfoTab from "./components/tabs/BasicInfoTab/BasicInfoTab";
import GrowthHistoryTab from "./components/tabs/GrowthHistoryTab/GrowthHistoryTab";
import GraftedPlantsTab from "./components/tabs/GraftedPlantsTab/GraftedPlantsTab";
import HarvestHistoryTab from "./components/tabs/HarvestHistoryTab/HarvestHistoryTab";
import { styles } from "./PlantDetailScreen.styles";
import TabButton from "./components/TabButton";
import RecordYieldTab from "./components/tabs/RecordYieldTab/RecordYieldTab";

const PlantDetailScreen: React.FC = () => {
  const route = useRoute<PlantDetailRouteProp>();
  const { plantId } = route.params;
  const [activeTab, setActiveTab] = useState("basic");

  const tabs = [
    { iconName: "information", label: "Basic", value: "basic" },
    { iconName: "chart-line", label: "Growth", value: "growth" },
    { iconName: "tree", label: "Grafted", value: "grafted" },
    { iconName: "note-edit", label: "Record", value: "record" },
    { iconName: "basket", label: "Harvest", value: "harvest" },
  ];

  const [plant] = useState<PlantDetailData>(mockPlantData);

  const renderTabContent = () => {
    switch (activeTab) {
      case "basic":
        return <BasicInfoTab plant={plant} />;
      case "growth":
        return <GrowthHistoryTab plant={plant} />;
      case "grafted":
        return <GraftedPlantsTab plant={plant} />;
      case "record":
        return <RecordYieldTab plant={plant} />;
      case "harvest":
        return <HarvestHistoryTab plant={plant} />;
      default:
        return <BasicInfoTab plant={plant} />;
    }
  };

  return (
    <View style={styles.container}>
      <PlantHeader plant={plant} />
      {/* Custom Tab */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TabButton
            key={tab.value}
            iconName={tab.iconName}
            label={tab.label}
            isActive={activeTab === tab.value}
            onPress={() => setActiveTab(tab.value)}
          />
        ))}
      </View>
      {/* Tab Content */}
      <View style={styles.tabContent}>{renderTabContent()}</View>
    </View>
  );
};

export default PlantDetailScreen;

const mockPlantData: PlantDetailData = {
  plantId: 2,
  plantCode: "P002",
  plantName: "Green Skin Pomelo Bccc",
  plantIndex: 2,
  healthStatus: "Moderate",
  createDate: "2024-02-02T00:00:00",
  updateDate: "2024-02-06T00:00:00",
  plantingDate: "2024-01-20T00:00:00",
  description:
    "Green Skin Pomelo - Type B\nThis plant shows good growth potential with proper care.",
  masterTypeId: 9,
  imageUrl:
    "https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cG9tZWxvfGVufDB8fDB8fHww",
  landRowId: 1,
  rowIndex: 1,
  landPlotId: 1,
  landPlotName: "Plot A",
  masterTypeName: "Green Skin Pomelo",
  characteristic: "Green skin, Sweet taste, Medium size fruit",
  growthStageID: 2,
  growthStageName: "Vegetative Growth",
  isDead: false,
  isPassed: false,
  passedDate: null,
  criteriaSummary: [
    { criteriaId: 1, criteriaName: "Height", value: "1.2", unit: "m" },
    { criteriaId: 2, criteriaName: "Leaf Count", value: "24", unit: "" },
  ],
  growthHistory: [
    {
      plantGrowthHistoryId: 1,
      content:
        "Plant shows signs of nutrient deficiency. Applied balanced fertilizer.",
      noteTaker: "John Doe",
      createDate: "2024-02-05T14:30:00",
      issueName: "Nutrient Deficiencyyy",
      plantResources: [
        "https://res.cloudinary.com/dgshx4n2c/image/upload/v1739010609/iy0c6zxgjkdx7ocmvmih.jpg",
        "https://res.cloudinary.com/dgshx4n2c/image/upload/v1739010609/iy0c6zxgjkdx7ocmvmih.jpg",
        "https://res.cloudinary.com/dgshx4n2c/video/upload/v1743152758/oykjjp75vzaeo5ycg88b.mp4",
      ],
      numberImage: 2,
      numberVideos: 0,
      plantId: 123,
    },
    {
      plantGrowthHistoryId: 2,
      content: "Initial planting completed. Plant looks healthy.",
      noteTaker: "Jane Smith",
      createDate: "2024-01-20T10:15:00",
      issueName: "",
      plantResources: [
        "https://res.cloudinary.com/dgshx4n2c/image/upload/v1739010609/iy0c6zxgjkdx7ocmvmih.jpg",
        "https://res.cloudinary.com/dgshx4n2c/video/upload/v1743152758/oykjjp75vzaeo5ycg88b.mp4",
      ],
      numberImage: 1,
      numberVideos: 0,
      plantId: 123,
    },
  ],
  graftedPlants: [
    {
      graftedPlantID: 1,
      graftedPlantCode: "GP001",
      graftedPlantName: "Grafted Pomelo A",
      status: "Healthy",
      graftedDate: "2024-02-10T00:00:00",
      isCompleted: false,
      plantLotID: 1,
    },
  ],
  harvestHistory: [
    {
      productHarvestHistoryId: 1,
      harvestDate: "2024-03-15T00:00:00",
      quantity: 190,
      unit: "kg",
      harvestCount: 1,
      productType: "Grade 2",
      marketValue: 475,
    },
    {
      productHarvestHistoryId: 2,
      harvestDate: "2024-09-20T00:00:00",
      quantity: 210,
      unit: "kg",
      harvestCount: 1,
      productType: "Grade 2",
      marketValue: 525,
    },
  ],
};
