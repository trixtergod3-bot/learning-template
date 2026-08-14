import { useContext } from 'react';

import { ApplicationServicesContext } from './applicationServicesContext';

export function useApplicationServices() {
  return useContext(ApplicationServicesContext);
}
