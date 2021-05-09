import { useEffect, useState } from "react";
import { hideLoadingIndicatorInterval } from "./hide-loading-indicator-interval";

export const useHasEnoughTimePassedToHideLoadingIndicator = () => {
  const [canHideIndicator, setCanHideIndicator] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCanHideIndicator(true);
    }, hideLoadingIndicatorInterval());
    return () => clearInterval(timeout);
  }, []);

  return canHideIndicator;
};
