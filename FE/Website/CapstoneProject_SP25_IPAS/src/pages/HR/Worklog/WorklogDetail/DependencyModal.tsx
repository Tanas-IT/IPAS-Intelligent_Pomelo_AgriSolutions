import React, { useState, useEffect } from 'react';
import { Button, Modal, Table, TableColumnsType } from 'antd';
import { worklogService } from '@/services';
import { DependencyWorklog, Worklog } from '@/payloads/worklog';

interface DependencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  worklogId: number;
}

const DependencyModal: React.FC<DependencyModalProps> = ({ isOpen, onClose, worklogId }) => {
  const [plans, setPlans] = useState<DependencyWorklog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDependencies = async () => {
      setLoading(true);
      try {
        const response = await worklogService.getDependencyWorklog(worklogId);
        console.log('Response:', response);

        if (response.statusCode === 200) {
          setPlans(response.data || []);
        } else {
          console.error('Failed to fetch dependencies:', response.message);
        }
      } catch (error) {
        console.error('Error fetching dependencies:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchDependencies();
    }
  }, [isOpen, worklogId]);

  const planColumns: TableColumnsType<DependencyWorklog> = [
    {
      title: 'Plan Name',
      dataIndex: 'planName',
      key: 'planName',
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record: DependencyWorklog) =>
        record.workLogs.length > 0 ? record.workLogs[0].status : 'No Worklogs',
    },
    {
      title: 'Order',
      key: 'order',
      render: () => 'N/A', // Nếu không có trường order, để tạm N/A
    },
  ];

  // Cột cho bảng Worklog (trong phần mở rộng)
  const worklogColumns: TableColumnsType<Worklog> = [
    {
      title: 'Worklog Name',
      dataIndex: 'workLogName',
      key: 'workLogName',
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
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  const tableStyles = `
  .table .ant-table-thead > tr > th {
    background: #bcd379 !important;
    color: #20461e !important;
    font-weight: 600;
  }
  .table .ant-table-tbody > tr:nth-child(odd) {
    background: #ffffff !important;
  }
  .table .ant-table-tbody > tr:nth-child(even) {
    background: #f9fcff !important;
  }
  .table .ant-table-tbody > tr:hover > td {
    background: #d8f0e7 !important;
  }
`;

  const expandedRowRender = (record: DependencyWorklog) => {
    return (
      <>
        <style>{tableStyles}</style>
        <Table
          columns={worklogColumns}
          dataSource={record.workLogs}
          rowKey="workLogId"
          pagination={false}
          locale={{ emptyText: 'No worklogs found' }}
        />
      </>
    );
  };

  return (
    <Modal
      title="Dependency Worklogs"
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      width={1000}
    >
      {loading ? (
        <p>Loading...</p>
      ) : plans.length === 0 ? (
        <p>No plans found.</p>
      ) : (
        <>
          <style>{tableStyles}</style>
          <Table
            columns={planColumns}
            dataSource={plans}
            rowKey="planId"
            pagination={false}
            expandable={{
              expandedRowRender,
              defaultExpandAllRows: false,
            }}
          />
        </>
      )}
    </Modal>
  );
};

export default DependencyModal;