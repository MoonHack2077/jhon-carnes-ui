import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/authService';

// Importa tus componentes reutilizables
import StyledButton from '../ui/Button';
import StyledInput from '../ui/Input';

// --- Estilos para la página de Login ---
const LoginPageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: ${props => props.theme.colors.background};
`;

const LoginForm = styled.form`
  width: 100%;
  max-width: 400px;
  padding: ${props => props.theme.spacing.large};
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: ${props => props.theme.borderRadius};
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
  margin: ${props => props.theme.spacing.medium};
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text};
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.large};
`;

const ErrorMessage = styled.p`
  color: ${props => props.theme.colors.error};
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.medium};
`;


// --- Componente de Login ---
const Login = () => {
  const [credentials, setCredentials] = useState({ code: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Limpia errores previos
    try {
      const data = await loginUser(credentials);
      login(data.token); // El AuthContext guarda el token y actualiza el estado
      navigate('/'); // Redirige al dashboard
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión.');
    }
  };

  return (
    <LoginPageContainer>
      <LoginForm onSubmit={handleSubmit}>
        <Title>Iniciar Sesión</Title>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <StyledInput
          type="text"
          name="code"
          placeholder="Código de usuario"
          value={credentials.code}
          onChange={handleChange}
          required
        />
        <StyledInput
          type="password"
          name="password"
          placeholder="Contraseña"
          value={credentials.password}
          onChange={handleChange}
          required
        />
        <StyledButton type="submit">
          Ingresar
        </StyledButton>
      </LoginForm>
    </LoginPageContainer>
  );
};

export default Login;