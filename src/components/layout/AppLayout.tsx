import { ReactNode } from 'react';
import AppSidebar from './AppSidebar';

const AppLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-muted/30 to-background overflow-hidden relative">
      {/* Subtle decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/20 blur-3xl pointer-events-none" />

      <AppSidebar />
      <main className="flex-1 min-w-0 p-4 xl:p-8 pt-16 lg:pt-8 h-screen overflow-y-auto relative z-10 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
