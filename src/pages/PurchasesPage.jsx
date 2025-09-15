import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getPurchases } from '../services/purchaseService';

// --- Estilos ---
const PurchasesContainer = styled.div``;
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
const PurchasesPage = () => {
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const data = await getPurchases();
        setPurchases(data);
      } catch (error) {
        console.error("Error al cargar las compras:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPurchases();
  }, []);

  if (isLoading) return <p>Cargando compras y gastos...</p>;

  return (
    <PurchasesContainer>
      <Title>Gestión de Compras y Gastos</Title>
      
      <Table>
        <thead>
          <tr>
            <Th>Fecha</Th>
            <Th>Proveedor</Th>
            <Th>Items</Th>
            <Th>Total</Th>
          </tr>
        </thead>
        <tbody>
          {purchases.map(purchase => (
            <tr key={purchase._id}>
              <Td>{new Date(purchase.date).toLocaleDateString()}</Td>
              <Td>{purchase.supplier}</Td>
              <Td>{purchase.items.map(item => item.name).join(', ')}</Td>
              <Td>${purchase.total.toLocaleString('es-CO')}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </PurchasesContainer>
  );
};

export default PurchasesPage;