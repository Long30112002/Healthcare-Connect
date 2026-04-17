// import { Outlet } from 'react-router-dom';
// import Header from './Header';
// import Footer from './Footer';

// const Layout = () => {
//   return (
//     <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
//       <Header />
//       <main className="flex-1">
//         <Outlet />
//      </main>
//       <Footer />
//     </div>
//   );
// };

// export default Layout; 

import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;