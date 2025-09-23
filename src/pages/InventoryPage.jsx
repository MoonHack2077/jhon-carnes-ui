import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import styled from 'styled-components';
import { getInventoriesByMonth } from '../services/inventoryService';
import { useAuth } from '../context/AuthContext';

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
  const { user } = useAuth();
  const [viewDate, setViewDate] = useState(new Date());
  const [inventories, setInventories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMonthData = async () => {
      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();
      console.log({ year, month });
      const data = await getInventoriesByMonth(year, month);
      console.log({ data });
      setInventories(data);
    };
    fetchMonthData();
  }, [viewDate]);

  const activeInventory = inventories.find(inv => inv.status === 'ACTIVE');

  const findInventoryForDate = (date) => {
    // 1. Crea un string 'YYYY-MM-DD' para el día del calendario (en tu hora local)
    const localDateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    // 2. Busca un inventario cuya fecha (guardada en UTC) comience con ese mismo string
    return inventories.find(inv => inv.date.startsWith(localDateString));
  };

  const handleDayClick = (date) => {
    // Usa la función de ayuda
    const inventoryForDay = findInventoryForDate(date);
    
    if (inventoryForDay) {
      navigate(`/inventory/form/${inventoryForDay._id}`);
    } else {
      if (activeInventory) {
        alert(`Debes cerrar el inventario activo del día ${new Date(activeInventory.date).toLocaleDateString()} antes de crear uno nuevo.`);
      } else {
        const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        navigate(`/inventory/form/new?date=${dateString}`);
      }
    }
  };


  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      // Usa la misma función de ayuda
      const inventoryForDay = findInventoryForDate(date);
      if (inventoryForDay) {
        const color = inventoryForDay.status === 'ACTIVE' ? '#FFC700' : '#FF1E1E';
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