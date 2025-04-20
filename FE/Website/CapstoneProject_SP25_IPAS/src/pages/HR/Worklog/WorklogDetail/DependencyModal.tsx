import React, { useState, useEffect } from 'react';
import { Button, Modal, Table } from 'antd';
import { worklogService } from '@/services';

interface DependencyWorklog {
  workLogId: number;
  planId: number;
  planName: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  status: string;
  order: string;
  date: string;
}

interface DependencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  worklogId: number;
}

const DependencyModal: React.FC<DependencyModalProps> = ({ isOpen, onClose, worklogId }) => {
  const [dependencies, setDependencies] = useState<DependencyWorklog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDependencies = async () => {
        setLoading(true);
        const response = await worklogService.getDependencyWorklog(worklogId);
        if(response.statusCode === 200) {
            setDependencies(response.data || []);
            setLoading(false);
        } else {
            console.error("Failed to fetch dependencies:", response.message);
        }
    };
  
    if (isOpen) {
      fetchDependencies();
    }
  }, [isOpen, worklogId]);
  

  const columns = [
    {
      title: 'Plan Name',
      dataIndex: 'planName',
      key: 'planName',
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Order',
      dataIndex: 'order',
      key: 'order',
    },
  ];

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
      width={800}
    >
      {loading ? (
        <p>Loading...</p>
      ) : dependencies.length === 0 ? (
        <p>No dependencies found.</p>
      ) : (
        <Table
          columns={columns}
          dataSource={dependencies}
          rowKey="workLogId"
          pagination={false}
        />
      )}
    </Modal>
  );
};

export default DependencyModal;