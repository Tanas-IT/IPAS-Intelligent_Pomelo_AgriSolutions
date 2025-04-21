import React, { useState } from "react";
import { View } from "react-native";
import { GraftedPlantDetailRouteProp } from "@/constants/Types";
import { useRoute } from "@react-navigation/native";
import { styles } from "./GraftedPlantDetail.styles";
import { TabButton } from "@/components";
import GraftedPlantDetailHeader from "../GraftedPlantDetailHeader/GraftedPlantDetailHeader";
import BasicInfoTab from "./tabs/BasicInfoTab/BasicInfoTab";
import GrowthHistoryTab from "./tabs/GrowthHistoryTab/GrowthHistoryTab";

const tabs = [
  { iconName: "information", label: "Basic", value: "basic" },
  { iconName: "chart-line", label: "Growth", value: "growth" },
];

const GraftedPlantDetail: React.FC = () => {
  const route = useRoute<GraftedPlantDetailRouteProp>();
  const { graftedPlantId } = route.params;
  const [activeTab, setActiveTab] = useState("basic");

  const renderTabContent = () => {
    switch (activeTab) {
      case "basic":
        return <BasicInfoTab graftedPlantId={Number(graftedPlantId)} />;
      case "growth":
        return <GrowthHistoryTab />;
      default:
        return <BasicInfoTab graftedPlantId={Number(graftedPlantId)} />;
    }
  };

  return (
    <View style={styles.container}>
      <GraftedPlantDetailHeader />
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

export default GraftedPlantDetail;
