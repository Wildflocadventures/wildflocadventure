
import React from "react";
import { Navbar } from "./Navbar";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  fullHeight?: boolean;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ 
  children, 
  className = "",
  fullHeight = false
}) => {
  return (
    <div className={`min-h-screen bg-black ${fullHeight ? 'h-screen' : ''}`}>
      <Navbar session={null} userProfile={null} />
      <div className={`pt-24 pb-16 ${className}`}>
        {children}
      </div>
    </div>
  );
};
