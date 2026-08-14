import { createContext } from 'react';

import type { ApplicationServices } from './services';

export const fallbackServices: ApplicationServices = {
  authGateway: null,
  userProfiles: null,
  learningRepository: null,
};

export const ApplicationServicesContext = createContext<ApplicationServices>(fallbackServices);
