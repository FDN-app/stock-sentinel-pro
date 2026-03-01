import { ReactNode } from 'react';
import AppSidebar from './AppSidebar';

const AppLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <main className="flex-1 min-w-0 p-4 lg:p-6 lg:pl-6 pt-14 lg:pt-6">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
