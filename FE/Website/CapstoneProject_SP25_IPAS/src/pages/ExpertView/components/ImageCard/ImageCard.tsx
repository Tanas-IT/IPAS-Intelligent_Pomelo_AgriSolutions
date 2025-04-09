import React from 'react';
import { GetImageResponse } from '@/payloads';
import style from './ImageCard.module.scss';

interface ImageCardProps {
  image: GetImageResponse;
  tagName?: string;
}

const ImageCard: React.FC<ImageCardProps> = ({ image, tagName }) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className={style.imageCard}>
      <div className={style.cardImageWrapper}>
        <img
          src={image.thumbnailUri || image.originalImageUri}
          alt="Tagged Image"
          className={style.cardImage}
        />
      </div>
      <div className={style.cardContent}>
        <div className={style.tagBadge}>
          {tagName || 'No Tag'}
        </div>
        <div className={style.meta}>
          <span>Created: {formatDate(image.created)}</span>
        </div>
      </div>
    </div>
  );
};

export default ImageCard;