import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getUsers, deleteUser } from '../services/userService';
import Button from '../ui/Button';

// --- Estilos (puedes reutilizar los de ProductsPage si los exportas) ---
const UsersContainer = styled.div``;
const Title = styled.h1``;
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: ${props => props.theme.spacing.large};
`;
const Th = styled.th`
  background-color: ${props => props.theme.colors.cardBackground};
  padding: ${props => props.theme.spacing.medium};
  text-align: left;
`;
const Td = styled.td`
  padding: ${props => props.theme.spacing.medium};
  border-bottom: 1px solid ${props => props.theme.colors.cardBackground};
`;

// --- Componente ---
const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await deleteUser(id);
        fetchUsers(); // Recargar la lista de usuarios
      } catch (error) {
        console.error("Error al eliminar el usuario:", error);
      }
    }
  };

  if (isLoading) return <p>Cargando usuarios...</p>;

  return (
    <UsersContainer>
      <Title>Gestión de Usuarios</Title>
      <Button onClick={() => alert('Abrir modal para crear usuario')}>+ Nuevo Usuario</Button>

      <Table>
        <thead>
          <tr>
            <Th>Nombre</Th>
            <Th>Código</Th>
            <Th>Rol</Th>
            <Th>Acciones</Th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <Td>{user.firstName} {user.lastName}</Td>
              <Td>{user.code}</Td>
              <Td>{user.role}</Td>
              <Td>
                <Button onClick={() => alert(`Editar ${user.firstName}`)} style={{marginRight: '8px'}}>Editar</Button>
                <Button onClick={() => handleDelete(user._id)} style={{backgroundColor: '#E74C3C'}}>Eliminar</Button>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </UsersContainer>
  );
};

export default UsersPage;