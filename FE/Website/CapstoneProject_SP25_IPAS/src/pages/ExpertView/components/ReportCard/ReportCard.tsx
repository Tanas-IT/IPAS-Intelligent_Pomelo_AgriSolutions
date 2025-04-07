import React from 'react';
import { Card, Button } from 'antd';
import { motion } from 'framer-motion';
import { GetReportResponse } from '@/payloads';

interface ReportCardProps {
  report: GetReportResponse;
  onReply: (id: number) => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, onReply }) => {
  const status = report.answerFromExpert ? 'answered' : 'pending';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card
        className={`reportCard ${status}`}
        cover={report.image && <img src={report.image.thumbnailUri} alt="Report" />}
        style={{ borderLeft: status === 'pending' ? '5px solid #FFB300' : '5px solid #2E7D32' }}
      >
        <div className="content">
          <p className="question">{report.questionOfUser}</p>
          <p className="questioner">From: {report.questionerName}</p>
          <div className="statusBar">
            <span className={`status ${status}`}>
              {status === 'pending' ? 'Pending' : 'Answered'}
            </span>
            <span className="training">
              {report.isTrainned ? 'Trained' : 'Not Trained'}
            </span>
          </div>
          <Button
            type="primary"
            shape="round"
            onClick={() => onReply(report.reportID)}
            style={{ marginTop: 10, background: '#2E7D32', borderColor: '#2E7D32' }}
          >
            {status === 'pending' ? 'Reply' : 'View Reply'}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default ReportCard;