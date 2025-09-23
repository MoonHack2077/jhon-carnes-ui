import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Modal from 'react-modal';
import { getProducts, createProduct, deleteProduct, updateProduct } from '../services/productService'; // 👈 Importa createProduct
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
  // --- ESTADOS ACTUALIZADOS ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingProduct, setEditingProduct] = useState(null); // Si tiene datos -> editando
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

  // --- FUNCIONES DEL MODAL ACTUALIZADAS ---
  const openModalForCreate = () => {
    setEditingProduct(null);
    setFormData({ name: '', price: '', description: '' });
    setIsModalOpen(true);
  };

  const openModalForEdit = (product) => {
    setEditingProduct(product);
    setFormData(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({});
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        // Lógica de Edición
        await updateProduct(editingProduct._id, formData);
      } else {
        // Lógica de Creación
        await createProduct(formData);
      }
      closeModal();
      fetchProducts();
    } catch (err) {
      setError(err.message || 'Error al guardar el producto.');
    }
  };

  if (isLoading) return <p>Cargando productos...</p>;

  return (
    <ProductsContainer>
      <Title>Gestión de Productos</Title>
      <Button onClick={openModalForCreate}>+ Nuevo Producto</Button>

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
                <Button onClick={() => openModalForEdit(product)} style={{ marginRight: '8px' }}>✏️</Button>
                <Button onClick={() => handleDelete(product._id)} style={{ backgroundColor: '#E74C3C' }}>🗑️</Button>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* --- NUEVO MODAL para crear productos --- */}
      <Modal isOpen={isModalOpen} onRequestClose={closeModal} style={customModalStyles}>
        <h2>{editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}</h2>
        {error && <p style={{color: 'red'}}>{error}</p>}
        <form onSubmit={handleFormSubmit}>
          <Input name="name" placeholder="Nombre del producto" value={formData.name || ''} onChange={handleInputChange} required />
          <Input name="price" type="number" placeholder="Precio" value={formData.price || ''} onChange={handleInputChange} required />
          <Input as="textarea" name="description" placeholder="Descripción (opcional)" value={formData.description || ''} onChange={handleInputChange} />
          <Button type="submit" style={{marginTop: '16px'}}>
            {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
          </Button>
        </form>
      </Modal>
    </ProductsContainer>
  );
};

export default ProductsPage;