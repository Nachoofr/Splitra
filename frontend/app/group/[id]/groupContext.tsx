import { createContext, useContext } from "react";

interface GroupContextType {
  group: any;
  memberCount: number;
}

export const GroupContext = createContext<GroupContextType | undefined>(
  undefined,
);

export const useGroup = () => {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error("useGroup must be used within GroupLayout");
  }
  return context;
};
