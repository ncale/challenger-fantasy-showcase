import type { Prettify } from "@challenger-fantasy/types";
import { create } from "zustand";

// TODO: these shouldn't be imported to use as assertions, they should be part of the type signatures
export type HomeTabs = "info" | "submit";
export type ActiveTabs = "info" | "submission";
export type ResultsTabs = "info" | "results" | "leaderboard";

type GameModalVariant =
  | {
      page: "home";
      selectedGameId: string;
      selectedSubmissionId?: never;
      tab: HomeTabs;
    }
  | {
      page: "active";
      selectedGameId: string;
      selectedSubmissionId: string;
      tab: ActiveTabs;
    }
  | {
      page: "results";
      selectedGameId: string;
      selectedSubmissionId: string;
      tab: ResultsTabs;
    };

type GameModalVariantWithoutTab = {
  [K in GameModalVariant as K["page"]]: Prettify<Omit<K, "tab"> & { tab?: K["tab"] }>;
}[GameModalVariant["page"]];

type GameModalState = {
  open: boolean;
  variant: GameModalVariant | null;
  openDialog: (variant: GameModalVariantWithoutTab) => void;
  closeDialog: () => void;
  setTab: (tab: HomeTabs | ActiveTabs | ResultsTabs) => void;
  setGameId: (id: string) => void;
  setSubmissionId: (id: string | null) => void;
  onOpenChange: (open: boolean) => void;
};

const DEFAULT_TAB = {
  home: "info" satisfies HomeTabs,
  active: "submission" satisfies ActiveTabs,
  results: "results" satisfies ResultsTabs,
} as const satisfies Record<GameModalVariant["page"], GameModalVariant["tab"]>;

export const useGameModal = create<GameModalState>((set, get) => ({
  open: false,
  variant: null,

  openDialog: (variant) => {
    const variantWithDefaultTab = {
      ...variant,
      tab: variant.tab ?? DEFAULT_TAB[variant.page],
    } as GameModalVariant;
    set({ open: true, variant: variantWithDefaultTab });
  },
  closeDialog: () => set({ open: false, variant: null }),

  onOpenChange: (open) => {
    if (!open) get().closeDialog();
  },

  setTab: (tab) =>
    set((state) => {
      if (!state.variant) return state;
      return { variant: { ...state.variant, tab } as GameModalVariant };
    }),

  setGameId: (id) =>
    set((state) => {
      if (!state.variant) return state;
      return { variant: { ...state.variant, selectedGameId: id } as GameModalVariant };
    }),

  setSubmissionId: (id) =>
    set((state) => {
      if (!state.variant) return state;
      return { variant: { ...state.variant, selectedSubmissionId: id } as GameModalVariant };
    }),
}));
