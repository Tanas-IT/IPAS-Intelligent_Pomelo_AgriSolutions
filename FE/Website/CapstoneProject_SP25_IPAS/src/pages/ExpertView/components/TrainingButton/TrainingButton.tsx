import React, { useState } from 'react';
import './TrainingButton.module.scss';
import { motion } from 'framer-motion';

interface TrainingButtonProps {
  onTrain: () => void;
}

const TrainingButton: React.FC<TrainingButtonProps> = ({ onTrain }) => {
  const [isTraining, setIsTraining] = useState(false);

  const handleTrain = () => {
    setIsTraining(true);
    onTrain();
    setTimeout(() => setIsTraining(false), 3000); // Giả lập training
  };

  return (
    <motion.button
      className="training-button"
      animate={isTraining ? { rotate: 360 } : { rotate: 0 }}
      transition={{ duration: 1, repeat: isTraining ? Infinity : 0 }}
      onClick={handleTrain}
    >
      {isTraining ? 'Training...' : 'Train Model'}
    </motion.button>
  );
};

export default TrainingButton;