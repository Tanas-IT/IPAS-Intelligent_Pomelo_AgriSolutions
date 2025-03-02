import { Col, Flex, Row } from "antd";
import style from "./Dashboard.module.scss";
import StatBox from "./components/StatBox/StatBox";
import { Icons } from "@/assets";

function Dashboard() {
  return (
    <Flex className={style.container}>
      <Flex>
      <Row gutter={[16, 16]}>
      <Col span={8}>
        <StatBox
          title="Total Plants"
          subtitle="1,250"
          icon={<Icons.addPLan style={{ fontSize: 24, color: "#52c41a" }} />}
          progress={0.75} // 75%
          increase="+5% this month"
        />
      </Col>
      <Col span={8}>
        <StatBox
          title="Total Users"
          subtitle="340"
          icon={<Icons.addPLan style={{ fontSize: 24, color: "#1890ff" }} />}
          progress={0.6} // 60%
          increase="+2% this month"
        />
      </Col>
      <Col span={8}>
        <StatBox
          title="Active Plans"
          subtitle="15"
          icon={<Icons.addPLan style={{ fontSize: 24, color: "#faad14" }} />}
          progress={0.9} // 90%
          increase="+10% this week"
        />
      </Col>
    </Row>
      </Flex>
    </Flex>
  );
}

export default Dashboard;
