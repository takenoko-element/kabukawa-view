// front/hooks/useBreakpoint.ts

import { useEffect, useState } from "react";
import { COLS } from "@/constants/cols";

type Breakpoint = keyof typeof COLS;

const BREAKPOINT_WIDTHS: Record<string, number> = {
  lg: 1280,
  md: 1024,
  sm: 768,
  xs: 480,
  xxs: 0,
};

const getBreakpoint = (width: number): Breakpoint => {
  const sortedBreakpoints = (
    Object.keys(BREAKPOINT_WIDTHS) as Breakpoint[]
  ).sort((a, b) => BREAKPOINT_WIDTHS[b] - BREAKPOINT_WIDTHS[a]);
  return (
    sortedBreakpoints.find((bp) => width >= BREAKPOINT_WIDTHS[bp]) ?? "xxs"
  );
};

export const useBreakpoint = (): Breakpoint => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("lg");

  useEffect(() => {
    const handleResize = () => {
      setBreakpoint(getBreakpoint(window.innerWidth));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return breakpoint;
};
