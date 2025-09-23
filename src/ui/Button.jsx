import styled from 'styled-components';

const StyledButton = styled.button`
  /* Ahora los colores vienen del tema que proveímos */
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.text};
  
  border: none;
  border-radius: ${props => props.theme.borderRadius};
  padding: 10px ${props => props.theme.spacing.medium};
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease;
  margin-bottom: ${props => props.theme.spacing.small};

  &:hover {
    transform: scale(1.05);
  }

  &:disabled {
    background-color: #555;
    cursor: not-allowed;
  }
`;

export default StyledButton;