import React, { useState } from 'react';
import { Modal, Input, Button, Form, Typography, Divider, Card, Space } from 'antd';
import { GetReportResponse, AnswerReportRequest } from '@/payloads';
import style from './ReplyModal.module.scss';
import { toast } from 'react-toastify';
import { UserAvatar } from '@/components';
import { FaCalendarAlt, FaCheck, FaQuestionCircle } from 'react-icons/fa';

const { Text, Title } = Typography;

interface ReplyModalProps {
  report: GetReportResponse;
  onClose: () => void;
  onSubmit: (data: AnswerReportRequest) => void;
}

const ReplyModal: React.FC<ReplyModalProps> = ({ report, onClose, onSubmit }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { answer: string }) => {
    setLoading(true);
    try {
      const data: AnswerReportRequest = {
        reportId: report.reportID,
        answer: values.answer,
      };
      await onSubmit(data);
      toast.success('Reply submitted successfully!');
    } catch (error) {
      toast.warning('Failed to submit reply. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={report.answerFromExpert ? 'View Reply' : 'Reply to Report'}
      open={true}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
      maskClosable={false}
      destroyOnClose
      className={style.replyModal}
    >
      <Card className={style.reportDetails}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {/* Question Section */}
            <div>
              <Title level={5} style={{ marginBottom: 8 }}>
                <FaQuestionCircle style={{ marginRight: 8, color: '#bcd379' }} />
                Question Details
              </Title>
              <div className={style.detailItem}>
                <Text strong>Question:</Text>
                <Text style={{ marginLeft: 8 }}>{report.questionOfUser}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                <Text strong>From:</Text>
                <Space style={{ marginLeft: 8 }}>
                <UserAvatar avatarURL={report.avatarOfQuestioner} size={40} />
                  <Text>{report.questionerName}</Text>
                </Space>
                </div>
                <div >
                <Space style={{ marginLeft: 8 }}>
                  <FaCalendarAlt />
                  <Text>{new Date(report.createdDate).toLocaleString()}</Text>
                </Space>
              </div>
              </div>
              
            </div>

            {/* Answer Section */}
            {report.answerFromExpert && (
              <div>
                <Title level={5} style={{ marginBottom: 8 }}>
                  <FaCheck style={{ marginRight: 8, color: '#bcd379' }} />
                  Expert Answer
                </Title>
                <div className={style.detailItem}>
                  <Text strong>Answered by:</Text>
                  <Space style={{ marginLeft: 8 }}>
                    <UserAvatar avatarURL={report.avatarOfAnswer} size={40} />
                    <Text>{report.answererName}</Text>
                  </Space>
                </div>
                <Card
                  bordered={false}
                  style={{
                    background: 'white',
                    marginTop: 12,
                    borderLeft: `3px solid #bcd379`,
                  }}
                >
                  <Text>{report.answerFromExpert}</Text>
                </Card>
              </div>
            )}
          </Space>
        </Card>

      {!report.answerFromExpert && (
        <>
          <Divider orientation="left" plain>
            <Text strong>New Reply</Text>
          </Divider>
          <Form 
            form={form} 
            onFinish={handleSubmit} 
            layout="vertical" 
            className={style.replyForm}
          >
            <Form.Item
              name="answer"
              label={<Text strong>Your Reply</Text>}
              rules={[{ required: true, message: 'Please enter your reply' }]}
            >
              <Input.TextArea 
                rows={4} 
                placeholder="Enter your reply here..." 
                showCount 
                maxLength={500}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className={style.submitButton}
                size="large"
              >
                Submit Reply
              </Button>
            </Form.Item>
          </Form>
        </>
      )}
    </Modal>
  );
};

export default ReplyModal;