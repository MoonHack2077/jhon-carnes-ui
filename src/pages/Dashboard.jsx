import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const DashboardContainer = styled.div`
  /* Puedes añadir estilos específicos para el dashboard aquí */
`;

const WelcomeMessage = styled.h1`
  color: ${props => props.theme.colors.primary};
`;

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <DashboardContainer>
      <WelcomeMessage>
        ¡Bienvenido, {user ? user.firstName : 'Usuario'}!
      </WelcomeMessage>
      <p>Aquí verás los resúmenes y métricas importantes de tu negocio.</p>
    </DashboardContainer>
  );
};

export default Dashboard;