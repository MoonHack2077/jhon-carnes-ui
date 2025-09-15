import styled from 'styled-components';

const StyledInput = styled.input`
  width: 90%;
  padding: 12px;
  margin-bottom: ${props => props.theme.spacing.medium};
  background-color: ${props => props.theme.colors.cardBackground};
  color: ${props => props.theme.colors.text};
  border: 1px solid #444;
  border-radius: ${props => props.theme.borderRadius};
  font-size: 16px;

  &::placeholder {
    color: #888;
  }
`;

export default StyledInput;