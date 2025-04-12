import React from "react";
import { Card, Statistic, Row, Col } from "antd";
import { StatisticPlanData } from "@/payloads/dashboard";
import { CheckCircleOutlined, CloseCircleOutlined, FileTextOutlined, ClockCircleOutlined } from "@ant-design/icons";

interface PlanOverviewProps {
  data: StatisticPlanData;
}

const PlanOverview: React.FC<PlanOverviewProps> = ({ data }) => {
  const { statusSummary } = data;
  const activePlans = statusSummary.status.active || 0;
  const pendingPlans = statusSummary.status.pending || 0;
  const completedPlans = statusSummary.status.completed || 0;
  const cancelledPlans = statusSummary.status.cancelled || 0;
  const totalPlans = statusSummary.total;

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
      <Col span={6}>
        <Card bordered={false} style={cardStyle}>
          <Statistic
            title="Active Plans"
            value={activePlans}
            prefix={<CheckCircleOutlined style={{ color: "#52c41a", marginRight: '10px' }} />}
            valueStyle={{ color: "#52c41a" }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card bordered={false} style={cardStyle}>
          <Statistic
            title="Cancelled Plans"
            value={cancelledPlans}
            prefix={<CloseCircleOutlined style={{ color: "#f5222d", marginRight: '10px' }} />}
            valueStyle={{ color: "#f5222d" }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card bordered={false} style={cardStyle}>
          <Statistic
            title="Total Plans"
            value={totalPlans}
            prefix={<FileTextOutlined style={{ color: "#1890ff", marginRight: '10px' }} />}
            valueStyle={{ color: "#1890ff" }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card bordered={false} style={cardStyle}>
          <Statistic
            title="Completed Plans"
            value={completedPlans}
            prefix={<ClockCircleOutlined style={{ color: "#fa8c16", marginRight: '10px' }} />}
            valueStyle={{ color: "#fa8c16" }}
          />
        </Card>
      </Col>
    </Row>
  );
};

const cardStyle = {
  background: "#fff",
  borderRadius: "10px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  textAlign: "center" as const,
  padding: "10px",
};

export default PlanOverview;