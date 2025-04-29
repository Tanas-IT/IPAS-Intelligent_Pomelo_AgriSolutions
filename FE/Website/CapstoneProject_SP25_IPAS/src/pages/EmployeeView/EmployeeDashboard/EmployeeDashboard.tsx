import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Table, Typography, Spin, message } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import style from './EmployeeDashboard.module.scss';
import { useStyle } from '@/hooks';
import { Icons, Images } from '@/assets';
import StatBox from '../../Dashboard/components/StatBox/StatBox';
import { dashboardService } from '@/services';
import { getFarmId, getUserId } from '@/utils';

const { Title } = Typography;

interface UpcomingTask {
  key: string;
  taskName: string;
  startTime: string;
  endTime: string;
  status: string;
}

interface Statistics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
}

const EmployeeDashboard = () => {
  const { styles } = useStyle();
  const [statistics, setStatistics] = useState<Statistics>({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
  });
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const columns = [
    {
      title: 'Worklog Name',
      dataIndex: 'taskName',
      key: 'taskName',
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime',
    },
    {
      title: 'End Time',
      dataIndex: 'endTime',
      key: 'endTime',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getEmployeeDashboard(Number(getFarmId()), Number(getUserId()));
        setStatistics({
          totalTasks: data.total,
          completedTasks: data.done,
          pendingTasks: data.notDone,
        });

        setUpcomingTasks(
          data.upcomingList.map((task) => ({
            key: task.worlogId.toString(),
            taskName: task.workLogName,
            startTime: task.startTime,
            endTime: task.endTime,
            status: task.status,
          })),
        );
      } catch (error: any) {
        console.error('Error fetching dashboard:', error);
        message.error(error.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className={style.employeeDashboard}>
      <Title level={2}>Dashboard Employee</Title>

      {loading ? (
        <Spin tip="Loading..." size="large" style={{ display: 'block', margin: '50px auto' }} />
      ) : (
        <>
          <div className={style.statisticsContainer}>
            <StatBox
              subtitle={statistics.totalTasks.toString()}
              title="Your Total Worklog"
              icon={<Icons.task style={{ color: '#3f8600', fontSize: 24 }} />}
              variant="large"
            />
            <StatBox
              subtitle={statistics.completedTasks.toString()}
              title="Your Completed Worklog"
              icon={<Icons.up style={{ color: '#3f8600', fontSize: 24 }} />}
              variant="large"
            />
            <StatBox
              subtitle={statistics.pendingTasks.toString()}
              title="Your Uncompleted Worklog"
              icon={<Icons.down style={{ color: '#cf1322', fontSize: 24 }} />}
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
              </span>
            }
            className={style.upcomingTasksCard}
          >
            <Table
              className={`${style.tbl} ${styles.customeTable2}`}
              dataSource={upcomingTasks}
              columns={columns}
              pagination={false}
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default EmployeeDashboard;