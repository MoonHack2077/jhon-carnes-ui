import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import DatePicker from 'react-datepicker';
import { getDashboardSummary } from '../services/dashboardService';

// --- Estilos ---
const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing.large};
`;

const StatBox = styled.div`
  background-color: ${props => props.theme.colors.cardBackground};
  padding: ${props => props.theme.spacing.medium};
  border-radius: ${props => props.theme.borderRadius};
  cursor: pointer; // Para el futuro modal
`;

const StatTitle = styled.h3`
  margin-top: 0;
  color: ${props => props.theme.colors.accent};
`;

const StatValue = styled.p`
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
`;

// --- Componente ---
const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true);
      try {
        const data = await getDashboardSummary(startDate, endDate);
        setSummary(data);
      } catch (error) {
        console.error("Error al cargar el resumen:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, [startDate, endDate]);

  const formatCurrency = (value) => `$${(value || 0).toLocaleString('es-CO')}`;

  return (
    <div>
      <h1>Panel</h1>
      <div>
        <DatePicker
          selectsRange={true}
          startDate={startDate}
          endDate={endDate}
          onChange={(update) => {
            setStartDate(update[0]);
            setEndDate(update[1]);
          }}
          isClearable={true}
        />
      </div>

      {isLoading ? <p>Calculando datos...</p> : summary && (
        <DashboardGrid>
          <StatBox>
            <StatTitle>Balance (Ingresos - Gastos)</StatTitle>
            <StatValue>{formatCurrency(summary.balance)}</StatValue>
          </StatBox>
          <StatBox>
            <StatTitle>Ingresos Totales</StatTitle>
            <p>Efectivo: {formatCurrency(summary.totalIncome.cash)}</p>
            <p>Transferencias: {formatCurrency(summary.totalIncome.transfers)}</p>
            <p>Total: {formatCurrency(summary.totalIncome.cash + summary.totalIncome.transfers)}</p>
          </StatBox>
          <StatBox>
            <StatTitle>Gastos Totales</StatTitle>
            <StatValue>{formatCurrency(summary.totalExpenses)}</StatValue>
          </StatBox>
          <StatBox>
            <StatTitle>Descuentos y Cortesías</StatTitle>
            <p>Descuentos: {formatCurrency(summary.totalDiscounts)}</p>
            <p>Cortesías: {formatCurrency(summary.totalCourtesiesValue)}</p>
          </StatBox>
          <StatBox>
            <StatTitle>Invertido en Colaboraciones</StatTitle>
            <StatValue>{formatCurrency(summary.totalCollaborationsValue)}</StatValue>
          </StatBox>

          <StatBox>
            <StatTitle>Insumos Nuevos (Arepas y Panes)</StatTitle>
            <p>Arepas: {summary.suppliesUsed.arepas} unidades</p>
            <p>Panes: {summary.suppliesUsed.panes} unidades</p>
          </StatBox>
        </DashboardGrid>
      )}
    </div>
  );
};

export default Dashboard;