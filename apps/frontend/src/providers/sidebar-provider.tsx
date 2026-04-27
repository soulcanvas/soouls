'use client';

import type React from 'react';
import { createContext, useContext, useState } from 'react';

interface SidebarContextType {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isLogoutOpen: boolean;
  setIsLogoutOpen: (isOpen: boolean) => void;
  toggle: () => void;
  openLogout: () => void;
  closeAll: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const toggle = () => setIsOpen((prev) => !prev);
  const openLogout = () => {
    setIsOpen(false);
    setIsLogoutOpen(true);
  };
  const closeAll = () => {
    setIsOpen(false);
    setIsLogoutOpen(false);
  };

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        setIsOpen,
        isLogoutOpen,
        setIsLogoutOpen,
        toggle,
        openLogout,
        closeAll,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
