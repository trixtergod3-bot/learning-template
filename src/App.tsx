import { RouterProvider } from 'react-router-dom';

import { appRouter } from '@/app/router';
import { applicationServices, type ApplicationServices } from '@/app/services';
import { AuthenticationProvider } from '@/features/auth/AuthenticationContext';

interface AppProps {
  services?: ApplicationServices;
}

export function App({ services = applicationServices }: AppProps) {
  return (
    <AuthenticationProvider authGateway={services.authGateway} userProfiles={services.userProfiles}>
      <RouterProvider router={appRouter} />
    </AuthenticationProvider>
  );
}
