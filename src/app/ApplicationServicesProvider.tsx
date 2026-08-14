import type { PropsWithChildren } from 'react';

import { ApplicationServicesContext } from './applicationServicesContext';
import type { ApplicationServices } from './services';

export function ApplicationServicesProvider({
  children,
  services,
}: PropsWithChildren<{ services: ApplicationServices }>) {
  return (
    <ApplicationServicesContext.Provider value={services}>
      {children}
    </ApplicationServicesContext.Provider>
  );
}
