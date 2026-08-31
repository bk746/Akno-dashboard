"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const INTRO_FAILSAFE_MS = 4500;

type IntroContextValue = {
  introActive: boolean;
  introComplete: boolean;
  completeIntro: () => void;
  skipIntro: () => void;
};

const IntroContext = createContext<IntroContextValue>({
  introActive: false,
  introComplete: true,
  completeIntro: () => {},
  skipIntro: () => {},
});

export function useIntro() {
  return useContext(IntroContext);
}

export function IntroProvider({
  children,
  enabled = true,
}: {
  children: ReactNode;
  enabled?: boolean;
}) {
  const [introActive, setIntroActive] = useState(false);
  const [introComplete, setIntroComplete] = useState(!enabled);

  const skipIntro = useCallback(() => {
    document.documentElement.classList.remove("intro-pending");
    document.documentElement.classList.add("intro-complete");
    setIntroActive(false);
    setIntroComplete(true);
  }, []);

  const completeIntro = useCallback(() => {
    setIntroActive(false);
    setIntroComplete(true);
    document.documentElement.classList.remove("intro-pending");
    document.documentElement.classList.add("intro-complete");
  }, []);

  useEffect(() => {
    if (!enabled) {
      skipIntro();
      return;
    }

    if (document.documentElement.classList.contains("intro-complete")) {
      skipIntro();
      return;
    }

    const failsafeId = window.setTimeout(skipIntro, INTRO_FAILSAFE_MS);
    return () => window.clearTimeout(failsafeId);
  }, [enabled, skipIntro]);

  const value = useMemo(
    () => ({
      introActive,
      introComplete,
      completeIntro,
      skipIntro,
    }),
    [introActive, introComplete, completeIntro, skipIntro],
  );

  return <IntroContext.Provider value={value}>{children}</IntroContext.Provider>;
}
