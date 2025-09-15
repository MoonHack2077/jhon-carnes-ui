import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/productService';
import Button from '../ui/Button';
import Input from '../ui/Input';

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
  // Aquí puedes añadir estados para un modal de edición/creación

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

  if (isLoading) return <p>Cargando productos...</p>;

  return (
    <ProductsContainer>
      <Title>Gestión de Productos</Title>
      <Button onClick={() => alert('Abrir modal para crear producto')}>+ Nuevo Producto</Button>

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
    </ProductsContainer>
  );
};

export default ProductsPage;