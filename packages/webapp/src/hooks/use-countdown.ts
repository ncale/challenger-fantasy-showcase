import { useEffect, useState } from "react";

export function useCountdown() {
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const startCountdown = (seconds: number) => {
    setCountdown(seconds);
  };

  return { countdown, startCountdown };
}
