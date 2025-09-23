import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Modal from 'react-modal';
import { getUsers, createUser, deleteUser } from '../services/userService'; // 👈 Importa createUser
import Button from '../ui/Button';
import Input from '../ui/Input';
import { theme } from '../theme/theme'; // Importa el tema para los estilos del modal

// --- Estilos para el Modal (puedes crear un componente aparte en ui/ si prefieres) ---
const customModalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: theme.colors.cardBackground,
    border: `1px solid ${theme.colors.primary}`,
    color: theme.colors.text,
    width: '90%',
    maxWidth: '500px',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)'
  }
};

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    code: '',
    password: '',
    role: 'EMPLOYEE' // Rol por defecto
  });
  const [error, setError] = useState('');

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

  // --- NUEVAS FUNCIONES ---
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await createUser(newUser);
      closeModal(); // Cierra el modal
      fetchUsers(); // Recarga la lista de usuarios
      // Limpia el formulario para la próxima vez
      setNewUser({ firstName: '', lastName: '', code: '', password: '', role: 'EMPLOYEE' }); 
    } catch (err) {
      setError(err.message || 'Error al crear el usuario.');
    }
  };

  if (isLoading) return <p>Cargando usuarios...</p>;

  return (
    <UsersContainer>
      <Title>Gestión de Usuarios</Title>
      <Button onClick={openModal}>+ Nuevo Usuario</Button>

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
              <Td>{user.role === 'ADMIN' ? 'Administrador' : 'Empleado'}</Td>
              <Td>
                <Button onClick={() => alert(`Editar ${user.firstName}`)} style={{marginRight: '8px'}}>✏️</Button>
                <Button onClick={() => handleDelete(user._id)} style={{backgroundColor: '#E74C3C'}}>🗑️</Button>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* --- NUEVO MODAL --- */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        style={customModalStyles}
        contentLabel="Crear Nuevo Usuario"
      >
        <h2>Crear Nuevo Usuario</h2>
        {error && <p style={{color: 'red'}}>{error}</p>}
        <form onSubmit={handleFormSubmit}>
          <Input name="firstName" placeholder="Nombre" onChange={handleInputChange} required />
          <Input name="lastName" placeholder="Apellido" onChange={handleInputChange} required />
          <Input name="code" placeholder="Código de usuario" onChange={handleInputChange} required />
          <Input name="password" type="password" placeholder="Contraseña" onChange={handleInputChange} required />
          <select name="role" onChange={handleInputChange} value={newUser.role} style={{width: '100%', padding: '10px', marginBottom: '16px'}}>
            <option value="EMPLOYEE">Empleado</option>
            <option value="ADMIN">Administrador</option>
          </select>
          <Button type="submit">Crear Usuario</Button>
        </form>
      </Modal>
    </UsersContainer>
  );
};

export default UsersPage;