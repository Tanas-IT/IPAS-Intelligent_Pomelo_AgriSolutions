import React, { useState } from 'react';
import { Modal, Input, Button, Form } from 'antd';
import { GetReportResponse, AnswerReportRequest } from '@/payloads';
import style from './ReplyModal.module.scss';
import { toast } from 'react-toastify';

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
      toast.success('Reply submitted successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (error) {
      toast.error('Failed to submit reply. Please try again.', {
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
      <div className={style.reportDetails}>
        <h3>Report Details</h3>
        <p><strong>Report Code:</strong> {report.reportCode}</p>
        <p><strong>Question:</strong> {report.questionOfUser}</p>
        <p><strong>From:</strong> {report.questionerName}</p>
        {report.answerFromExpert && (
          <p><strong>Current Reply:</strong> {report.answerFromExpert}</p>
        )}
      </div>

      {!report.answerFromExpert && (
        <Form form={form} onFinish={handleSubmit} layout="vertical" className={style.replyForm}>
          <Form.Item
            name="answer"
            label="Your Reply"
            rules={[{ required: true, message: 'Please enter your reply' }]}
          >
            <Input.TextArea rows={4} placeholder="Enter your reply here..." />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className={style.submitButton}
            >
              Submit Reply
            </Button>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default ReplyModal;