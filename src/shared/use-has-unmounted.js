import { useEffect } from "react";

export const useHasUnmounted = () => {
  let hasUnmounted = false;
  useEffect(() => {
    hasUnmounted = false;
    return () => (hasUnmounted = true);
  }, []);

  return hasUnmounted;
};
