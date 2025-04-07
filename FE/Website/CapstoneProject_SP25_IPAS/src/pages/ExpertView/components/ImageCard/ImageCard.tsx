import React from 'react';
import './ImageCard.module.scss';
import { motion } from 'framer-motion';
import { GetImageResponse, GetTagResponse } from '@/payloads';

interface ImageCardProps {
  image: GetImageResponse & { tags: GetTagResponse[] }; // Bổ sung tags từ BE
  onTag: (id: string) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ image, onTag }) => {
  return (
    <motion.div
      className="image-card"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <img src={image.thumbnailUri} alt="Vision" className="image" />
      <div className="tags">
        {image.tags && image.tags.length > 0 ? (
          image.tags.map(tag => (
            <span key={tag.id} className="tag">{tag.name}</span>
          ))
        ) : (
          <button className="tag-button" onClick={() => onTag(image.id)}>
            Tag
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ImageCard;