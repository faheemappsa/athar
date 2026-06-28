import { useLocation } from "react-router-dom";

export const useAtharRefreshKey = () => {
  const location = useLocation();
  return `${location.pathname}-${location.key}`;
};
