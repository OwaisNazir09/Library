import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Navbar';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  React.useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden antialiased">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6">
          <div className="
            mx-auto
            max-w-7xl
            bg-white 
            border border-gray-200 
            rounded-xl 
            shadow-sm
            p-2 md:p-4 lg:p-6
            min-h-[calc(100vh-2rem)]
            transition-all
            duration-200
          ">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{
                  duration: 0.2,
                  ease: [0.25, 0.1, 0.25, 1]
                }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;