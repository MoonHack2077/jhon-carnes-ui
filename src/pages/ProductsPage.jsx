import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Modal from 'react-modal';
import { getProducts, createProduct, deleteProduct } from '../services/productService'; // 👈 Importa createProduct
import Button from '../ui/Button';
import Input from '../ui/Input';
import { theme } from '../theme/theme';

// --- Estilos para el Modal ---
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

// --- Estilos ---
const ProductsContainer = styled.div` /* ... */ `;
const Title = styled.h1` /* ... */ `;
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
// ... (Puedes añadir más estilos para el formulario/modal)

// --- Componente ---
const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // --- NUEVOS ESTADOS para el modal y el formulario ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '' });
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await deleteProduct(id);
        fetchProducts(); // Vuelve a cargar la lista para reflejar el cambio
      } catch (error) {
        console.error("Error al eliminar el producto:", error);
      }
    }
  };

  // --- NUEVAS FUNCIONES para controlar el modal ---
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setError('');
    setNewProduct({ name: '', price: '', description: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProduct(newProduct);
      closeModal();
      fetchProducts(); // Recarga la lista de productos
    } catch (err) {
      setError(err.message || 'Error al crear el producto.');
    }
  };


  if (isLoading) return <p>Cargando productos...</p>;

  return (
    <ProductsContainer>
      <Title>Gestión de Productos</Title>
      <Button onClick={openModal}>+ Nuevo Producto</Button>

      <Table>
        <thead>
          <tr>
            <Th>Nombre</Th>
            <Th>Precio</Th>
            <Th>Acciones</Th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product._id}>
              <Td>{product.name}</Td>
              <Td>${product.price.toLocaleString('es-CO')}</Td>
              <Td>
                <Button onClick={() => alert(`Editar ${product.name}`)} style={{marginRight: '8px'}}>Editar</Button>
                <Button onClick={() => handleDelete(product._id)} style={{backgroundColor: '#E74C3C'}}>Eliminar</Button>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* --- NUEVO MODAL para crear productos --- */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        style={customModalStyles}
        contentLabel="Crear Nuevo Producto"
      >
        <h2>Crear Nuevo Producto</h2>
        {error && <p style={{color: 'red'}}>{error}</p>}
        <form onSubmit={handleFormSubmit}>
          <Input name="name" placeholder="Nombre del producto" value={newProduct.name} onChange={handleInputChange} required />
          <Input name="price" type="number" placeholder="Precio" value={newProduct.price} onChange={handleInputChange} required />
          <Input as="textarea" name="description" placeholder="Descripción (opcional)" value={newProduct.description} onChange={handleInputChange} />
          <Button type="submit" style={{marginTop: '16px'}}>Crear Producto</Button>
        </form>
      </Modal>
    </ProductsContainer>
  );
};

export default ProductsPage;