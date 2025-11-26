'use client';

import React, { createContext, useState, useContext } from 'react';

type NavContextType = {
  direction: number;
  setDirection: (dir: number) => void;
};

const NavigationContext = createContext<NavContextType>({
  direction: 1,
  setDirection: () => {},
});

export const useNavigation = () => useContext(NavigationContext);

export const NavigationProvider = ({ children }: { children: React.ReactNode }) => {
  const [direction, setDirection] = useState(1);
  return (
    <NavigationContext.Provider value={{ direction, setDirection }}>
      {children}
    </NavigationContext.Provider>
  );
};
