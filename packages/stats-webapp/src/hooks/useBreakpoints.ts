import { useBreakpoint } from "use-breakpoint";

const BREAKPOINTS = {
  base: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export function useBreakpoints() {
  const { breakpoint } = useBreakpoint(BREAKPOINTS, "base");

  return {
    sm: breakpoint !== "base",
    md: ["md", "lg", "xl", "2xl"].includes(breakpoint),
    lg: ["lg", "xl", "2xl"].includes(breakpoint),
    xl: ["xl", "2xl"].includes(breakpoint),
    "2xl": breakpoint === "2xl",

    isMobile: breakpoint === "base",
    isTablet: ["sm", "md"].includes(breakpoint),
    isDesktop: ["lg", "xl", "2xl"].includes(breakpoint),
  };
}
