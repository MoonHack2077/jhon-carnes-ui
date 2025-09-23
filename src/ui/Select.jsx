import styled from 'styled-components';

const StyledSelectWrapper = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;
`;

const SelectArrow = styled.div`
  position: absolute;
  top: 50%;
  right: 15px;
  transform: translateY(-50%);
  pointer-events: none; /* Para que el clic atraviese el icono y llegue al select */
  color: ${props => props.theme.colors.text};
`;

const SelectElement = styled.select`
  /* --- 1. Reseteo y Estilos Base --- */
  width: 100%;
  padding: 12px 40px 12px 12px; /* Espacio extra a la derecha para la flecha */
  margin-bottom: ${props => props.theme.spacing.medium};
  background-color: ${props => props.theme.colors.cardBackground};
  color: ${props => props.theme.colors.text};
  border: 1px solid #444;
  border-radius: ${props => props.theme.borderRadius};
  font-size: 16px;
  cursor: pointer;

  /* --- 2. Ocultar la Flecha Nativa --- */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;

  /* --- 3. Estilo de Foco --- */
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const StyledSelect = (props) => {
  return (
    <StyledSelectWrapper>
      <SelectElement {...props} />
      <SelectArrow>▼</SelectArrow>
    </StyledSelectWrapper>
  );
};

export default StyledSelect;