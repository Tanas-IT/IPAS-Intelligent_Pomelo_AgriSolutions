import React, { useState } from "react";
import { View } from "react-native";
import { PlantDetailRouteProp } from "@/constants/Types";
import { useRoute } from "@react-navigation/native";
import BasicInfoTab from "./components/tabs/BasicInfoTab/BasicInfoTab";
import GrowthHistoryTab from "./components/tabs/GrowthHistoryTab/GrowthHistoryTab";
import GraftedPlantsTab from "./components/tabs/GraftedPlantsTab/GraftedPlantsTab";
import HarvestHistoryTab from "./components/tabs/HarvestHistoryTab/HarvestHistoryTab";
import { styles } from "./PlantDetailScreen.styles";
import RecordYieldTab from "./components/tabs/RecordYieldTab/RecordYieldTab";
import PlantDetailHeader from "../PlantDetailHeader/PlantDetailHeader";
import { TabButton } from "@/components";

const tabs = [
  { iconName: "information", label: "Basic", value: "basic" },
  { iconName: "chart-line", label: "Growth", value: "growth" },
  { iconName: "tree", label: "Grafted", value: "grafted" },
  { iconName: "note-edit", label: "Record", value: "record" },
  { iconName: "basket", label: "Statistic", value: "harvest" },
];

const PlantDetailScreen: React.FC = () => {
  const route = useRoute<PlantDetailRouteProp>();
  const { plantId } = route.params;
  const [activeTab, setActiveTab] = useState("basic");

  const renderTabContent = () => {
    switch (activeTab) {
      case "basic":
        return <BasicInfoTab plantId={Number(plantId)} />;
      case "growth":
        return <GrowthHistoryTab />;
      case "grafted":
        return <GraftedPlantsTab plantId={Number(plantId)} />;
      case "record":
        return <RecordYieldTab />;
      case "harvest":
        return <HarvestHistoryTab plantId={Number(plantId)} />;
      default:
        return <BasicInfoTab plantId={Number(plantId)} />;
    }
  };

  return (
    <View style={styles.container}>
      <PlantDetailHeader />
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
