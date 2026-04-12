import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Navbar';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen bg-[#F1F5F9] overflow-hidden antialiased">

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">

        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 px-4 md:px-8 py-6 overflow-y-auto">

          <div className="  border  rounded-2xl shadow-sm mt-4 p-6 md:p-8 min-h-full">

            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
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