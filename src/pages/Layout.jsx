import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

// --- Estilos para el Layout ---
const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
`;

const Sidebar = styled.nav`
  width: 250px;
  background-color: ${props => props.theme.colors.cardBackground};
  padding: ${props => props.theme.spacing.large};
  display: flex;
  flex-direction: column;
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    position: fixed; // Se posiciona sobre el contenido
    top: 0;
    left: 0;
    height: 100%;
    z-index: 1000; // Se asegura de que esté por encima de todo
    transform: translateX(${props => props.isOpen ? '0' : '-100%'}); // 👈 La magia está aquí
    transition: transform 0.3s ease-in-out; // 👈 La animación
  }
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  /* flex-grow: 1; Empuja el botón de logout hacia abajo */
`;

const NavItem = styled(NavLink)`
  display: block;
  color: ${props => props.theme.colors.text};
  text-decoration: none;
  padding: ${props => props.theme.spacing.medium};
  border-radius: ${props => props.theme.borderRadius};
  margin-bottom: ${props => props.theme.spacing.small};

  &.active {
    background-color: ${props => props.theme.colors.primary};
  }
`;

const LogoutButton = styled.button`
  /* Estilos similares a StyledButton pero para este contexto */
  background-color: transparent;
  color: ${props => props.theme.colors.text};
  border: 1px solid ${props => props.theme.colors.primary};
  /* ...otros estilos... */
`;

const MainContent = styled.main`
  flex-grow: 1;
  padding: ${props => props.theme.spacing.large};
`;

const MobileHeader = styled.header`
  display: none; // Oculto por defecto en escritorio
  background-color: ${props => props.theme.colors.cardBackground};
  padding: ${props => props.theme.spacing.medium};

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    display: block; // Visible solo en móvil
  }
`;

const HamburgerButton = styled.button`
  display:none; 
  background: none;
  border: none;
  color: ${props => props.theme.colors.text};
  font-size: 24px;
  cursor: pointer;

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    display: block; // Visible solo en móvil
  }
`;

// --- Componente Layout ---
const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => { // 👈 Añade esta función
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <LayoutContainer>
      <Sidebar isOpen={isSidebarOpen}>
        <div>
          <HamburgerButton onClick={toggleSidebar}>
            ☰
          </HamburgerButton>
          <h2>Jhon Carnes</h2>
        </div>
        <NavList>
          <li><NavItem to="/inventory">Inventario</NavItem></li>

          {/* Enlaces solo para Administradores */}
          {user && user.role === 'ADMIN' && (
            <>
              <li><NavItem to="/">Panel</NavItem></li>
              <li><NavItem to="/users">Usuarios</NavItem></li>
              <li><NavItem to="/products">Productos</NavItem></li>
              <li><NavItem to="/purchases">Compras</NavItem></li>
            </>
          )}
        </NavList>
        <LogoutButton onClick={handleLogout}>Cerrar Sesión</LogoutButton>
      </Sidebar>


      <MainContent>
        <HamburgerButton onClick={toggleSidebar}>
          ☰
        </HamburgerButton>
        <Outlet /> {/* Aquí se renderizarán Dashboard, InventoryPage, etc. */}
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout;