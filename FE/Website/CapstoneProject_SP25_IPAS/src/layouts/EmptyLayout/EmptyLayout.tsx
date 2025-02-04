import React, { ReactNode } from "react";
import { useRedirectAuth, useToastFromLocalStorage, useToastMessage } from "@/hooks";
import { Loading } from "@/components";

interface EmptyLayoutProps {
  children: ReactNode;
}

const EmptyLayout: React.FC<EmptyLayoutProps> = ({ children }) => {
  const isAuthenticated = useRedirectAuth();
  useToastMessage();
  useToastFromLocalStorage();

  if (isAuthenticated) return <Loading />;
  return <>{children}</>;
};

export default EmptyLayout;
