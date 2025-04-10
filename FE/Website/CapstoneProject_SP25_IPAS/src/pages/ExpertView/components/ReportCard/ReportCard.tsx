import React, { useState } from 'react';
import { Button, Flex, Image } from 'antd';
import { GetReportResponse } from '@/payloads';
import style from './ReportCard.module.scss';
import AssignTagModal from '../AssignTagModal/AssignTagModal';

interface ReportCardProps {
  report: GetReportResponse;
  onReply: (report: GetReportResponse) => void;
  onTagAssigned: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, onReply, onTagAssigned }) => {
  const [showAssignTagModal, setShowAssignTagModal] = useState(false);
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className={style.reportCard}>
      <Flex justify='space-between' className={style.cardHeader}>
        <Flex>
          <div className={style.icon}>
            <span>📋</span>
          </div>
          {/* <div className={style.title}>{report.reportCode}</div> */}
          <Flex vertical className={style.meta} gap={0}>
            <div className={style.questioner}>{report.questionerName}</div>
            <div className={style.metaItem}>{formatDate(report.createdDate)}</div>
          </Flex>
        </Flex>
        <Flex>
          <div>#{report.reportCode}</div>
        </Flex>
      </Flex>
      <div className={style.question}>{report.questionOfUser}</div>
      {report.imageURL && (
        <div className={style.imageContainer}>
          <Image
            src={report.imageURL}
            width="100%"
            height={160}
            className={style.cardImage}
            crossOrigin='anonymous'
          />
        </div>
      )}
      <div className={style.cardFooter}>
        <span
          className={`${style.status} ${report.answerFromExpert ? style.answered : style.pending
            }`}
        >
          {report.answerFromExpert ? 'Answered' : 'Pending'}
        </span>
        <Flex gap={8}>
          <Button
            type="primary"
            className={style.actionButton}
            onClick={() => onReply(report)}
          >
            {report.answerFromExpert ? 'View Reply' : 'Reply'}
          </Button>
          {
            !report.isTrainned && (
              <Button
                className={style.assignTagButton}
                onClick={() => setShowAssignTagModal(true)}
              >
                Assign Tag
              </Button>
            )
          }

        </Flex>
      </div>
      {showAssignTagModal && (
        <AssignTagModal
          reportId={report.reportID}
          onClose={() => setShowAssignTagModal(false)}
          onTagAssigned={onTagAssigned}
        />
      )}
    </div>
  );
};

export default ReportCard;
