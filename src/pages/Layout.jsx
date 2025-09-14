import React from 'react';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div>
      {/* Aquí irá la barra de navegación lateral o superior */}
      <main>
        {/* Outlet renderizará el componente hijo (Dashboard, etc.) */}
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;