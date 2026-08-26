import { createContext, useContext } from "react";

export type DraftTab = "fighters" | "queue";

export type QueuedFighter = {
  id: string;
  name: string;
  opponent: string;
  weightClass?: string;
};

type DraftTabContextValue = {
  activeTab: DraftTab;
  setActiveTab: (tab: DraftTab) => void;
  queue: QueuedFighter[];
  addToQueue: (fighter: QueuedFighter) => void;
  removeFromQueue: (id: string) => void;
};

export const DraftTabContext = createContext<DraftTabContextValue>({
  activeTab: "fighters",
  setActiveTab: () => {},
  queue: [],
  addToQueue: () => {},
  removeFromQueue: () => {},
});

export const useDraftTab = () => useContext(DraftTabContext);
