import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import styled from 'styled-components';
import { getInventoriesByMonth } from '../services/inventoryService';

const CalendarContainer = styled.div`
  .react-calendar {
    width: 100%;
    border: 1px solid ${props => props.theme.colors.cardBackground};
    background-color: ${props => props.theme.colors.cardBackground};
    color: ${props => props.theme.colors.text};
  }
  /* ... Puedes añadir más estilos para personalizar el calendario ... */
`;

const Dot = styled.div`
  height: 8px;
  width: 8px;
  border-radius: 50%;
  margin: 2px auto;
`;

const InventoryPage = () => {
  const [viewDate, setViewDate] = useState(new Date());
  const [inventories, setInventories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMonthData = async () => {
      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();
      const data = await getInventoriesByMonth(year, month);
      setInventories(data);
    };
    fetchMonthData();
  }, [viewDate]);

  const activeInventory = inventories.find(inv => inv.status === 'ACTIVE');

  const handleDayClick = (date) => {
    const inventoryForDay = inventories.find(inv => new Date(inv.date).toDateString() === date.toDateString());
    
    if (inventoryForDay) {
      // Si hay inventario para ese día, navega para verlo/editarlo
      navigate(`/inventory/form/${inventoryForDay._id}`);
    } else {
      // Si el día está vacío, es para crear uno nuevo
      if (activeInventory) {
        alert(`Debes cerrar el inventario activo del día ${new Date(activeInventory.date).toLocaleDateString()} antes de crear uno nuevo.`);
      } else {
        // Navega para crear, pasando la fecha en formato ISO
        navigate(`/inventory/form/new?date=${date.toISOString().split('T')[0]}`);
      }
    }
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const inventoryForDay = inventories.find(inv => new Date(inv.date).toDateString() === date.toDateString());
      if (inventoryForDay) {
        const color = inventoryForDay.status === 'ACTIVE' ? '#FFC700' : '#FF1E1E'; // Amarillo o Rojo
        return <Dot style={{ backgroundColor: color }} />;
      }
    }
    return null;
  };

  return (
    <div>
      <h1>Calendario de Inventarios</h1>
      <CalendarContainer>
        <Calendar
          onClickDay={handleDayClick}
          onActiveStartDateChange={({ activeStartDate }) => setViewDate(activeStartDate)}
          tileContent={tileContent}
        />
      </CalendarContainer>
    </div>
  );
};

export default InventoryPage;