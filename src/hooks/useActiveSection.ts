import { useLocation } from 'react-router-dom';
import { getSectionByPath } from '../config/sections';

export const useActiveSection = () => {
  const location = useLocation();
  return getSectionByPath(location.pathname);
};
