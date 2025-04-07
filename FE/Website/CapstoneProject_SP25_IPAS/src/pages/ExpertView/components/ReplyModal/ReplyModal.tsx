import React, { useState } from 'react';
import './ReplyModal.module.scss';
import { motion } from 'framer-motion';
import { AnswerReportRequest, GetReportResponse } from '@/payloads';

interface ReplyModalProps {
  report: GetReportResponse;
  onClose: () => void;
  onSubmit: (data: AnswerReportRequest) => void;
}

const ReplyModal: React.FC<ReplyModalProps> = ({ report, onClose, onSubmit }) => {
  const [answer, setAnswer] = useState(report.answerFromExpert || '');

  const handleSubmit = () => {
    onSubmit({ reportId: report.reportID, answer });
    onClose();
  };

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="modal-content"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
      >
        <h3>Reply to Report #{report.reportCode}</h3>
        <p>{report.questionOfUser}</p>
        <textarea
          className="textarea"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter your answer..."
          disabled={!!report.answerFromExpert}
        />
        <div className="button-group">
          <button className="close-button" onClick={onClose}>
            Close
          </button>
          {!report.answerFromExpert && (
            <button className="submit-button" onClick={handleSubmit}>
              Submit
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ReplyModal;