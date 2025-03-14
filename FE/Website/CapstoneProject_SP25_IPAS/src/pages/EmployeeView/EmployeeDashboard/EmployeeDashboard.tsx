import React from "react";
import { Card, Col, Row, Statistic, Table, Typography } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import style from "./EmployeeDashboard.module.scss";
import { useStyle } from "@/hooks";
import { Icons, Images } from "@/assets";
import StatBox from "../../Dashboard/components/StatBox/StatBox";

const { Title } = Typography;

// Fake data
const upcomingTasks = [
    {
        key: "1",
        taskName: "Tưới cây",
        startTime: "08:00 AM",
        endTime: "10:00 AM",
        status: "Chưa bắt đầu",
    },
    {
        key: "2",
        taskName: "Bón phân",
        startTime: "02:00 PM",
        endTime: "04:00 PM",
        status: "Chưa bắt đầu",
    },
];

const statistics = {
    totalTasks: 10,
    completedTasks: 6,
    pendingTasks: 4,
};

const notifications = [
    "Công việc 'Tưới cây' sắp bắt đầu lúc 08:00 AM.",
    "Công việc 'Bón phân' sắp bắt đầu lúc 02:00 PM.",
];

const EmployeeDashboard = () => {
    const { styles } = useStyle();
    const columns = [
        {
            title: "Worklog Name",
            dataIndex: "taskName",
            key: "taskName",
        },
        {
            title: "Start Time",
            dataIndex: "startTime",
            key: "startTime",
        },
        {
            title: "End Time",
            dataIndex: "endTime",
            key: "endTime",
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
        },
    ];

    return (
        <div className={style.employeeDashboard}>
            <Title level={2}>Dashboard Employee</Title>

            <div className={style.statisticsContainer}>
                <StatBox
                    subtitle={statistics.totalTasks.toString()}
                    title="Your Total Worklog"
                    icon={<Icons.task style={{ color: "#3f8600", fontSize: 24 }} />}
                    variant="large"
                />
                <StatBox
                    subtitle={statistics.completedTasks.toString()}
                    title="Your Completed Worklog"
                    icon={<Icons.up style={{ color: "#3f8600", fontSize: 24 }} />}
                    variant="large"
                />
                <StatBox
                    subtitle={statistics.pendingTasks.toString()}
                    title="Your Uncompleted Worklog"
                    icon={<Icons.down style={{ color: "#cf1322", fontSize: 24 }} />}
                    variant="large"
                />
            </div>

            <Card
                title={
                    <span className={style.titleCard}>
                        <img
                            src={Images.worklog}
                            alt="Worklog Icon"
                            style={{ width: 20, height: 20, marginRight: 8 }}
                        />
                        Upcoming Worklog
                    </span>}
                className={style.upcomingTasksCard}>
                <Table className={`${style.tbl} ${styles.customeTable2}`} dataSource={upcomingTasks} columns={columns} pagination={false} />
            </Card>
        </div>
    );
};

export default EmployeeDashboard;