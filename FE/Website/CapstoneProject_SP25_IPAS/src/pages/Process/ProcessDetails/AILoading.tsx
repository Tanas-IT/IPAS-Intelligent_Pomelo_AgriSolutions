import React from 'react';
import style from './AILoading.module.scss';

interface AILoadingProps {
  message?: string;
  className?: string;
}

const AILoading: React.FC<AILoadingProps> = ({ 
  message = 'IPAS is thinking',
  className 
}) => {
  return (
    <div className={`${style.container} ${className}`}>
      <svg className={style.svgFilter}>
        <defs>
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
            <feColorMatrix values="
              1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              0 0 0 20 -10" />
          </filter>
        </defs>
      </svg>

      <div className={style.brain}>
        <div className={`${style.lobe} ${style.left}`}></div>
        <div className={`${style.lobe} ${style.right}`}></div>
        <div className={style.core}></div>
        <div className={style.connection}></div>
        <div className={style.pulse}></div>
      </div>
      
      <div className={style.loadingText}>
        {message}
        <span className={style.ellipsis}>
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </div>
      
      <div className={style.progressBar}>
        <div className={style.progress}></div>
      </div>
    </div>
  );
};

export default AILoading;