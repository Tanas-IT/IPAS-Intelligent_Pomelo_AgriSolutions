import React from "react";
import { Skeleton } from "antd";

interface LoadingSkeletonProps {
  rows?: number;
  avatar?: boolean;
  width?: number | string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  rows = 3,
  avatar = false,
  width = "100%",
}) => {
  return <Skeleton active avatar={avatar} paragraph={{ rows, width }} />;
};

export default LoadingSkeleton;
