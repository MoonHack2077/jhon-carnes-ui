import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getActiveInventory, getInventoryTemplate, createInventory, updateInventory } from '../services/inventoryService';
import { getUsers } from '../services/userService.js';
import { getProducts } from '../services/productService';

import Button from '../ui/Button';
import Input from '../ui/Input';

// --- Estilos ---
const InventoryContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.medium};
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text};
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.large};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.large};
`;

const FormSection = styled.fieldset`
  background-color: ${props => props.theme.colors.cardBackground};
  border: 1px solid #444;
  border-radius: ${props => props.theme.borderRadius};
  padding: ${props => props.theme.spacing.medium};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.medium};
`;

const SectionTitle = styled.legend`
  color: ${props => props.theme.colors.primary};
  font-weight: bold;
  font-size: 1.2rem;
  padding: 0 ${props => props.theme.spacing.small};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${props => props.theme.spacing.medium};
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.small};
  font-size: 0.9rem;
`;

const DynamicRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr auto auto;
  gap: ${props => props.theme.spacing.small};
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.small};
`;

const DeleteButton = styled.button`
  background: ${props => props.theme.colors.error};
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-weight: bold;
`;


// --- Componente ---
const InventoryPage = () => {
  const [inventory, setInventory] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [inventoryData, usersData, productsData] = await Promise.all([
          getActiveInventory().catch(() => null),
          getUsers().catch(() => []),
          getProducts().catch(() => [])
        ]);

        let finalInventoryData = inventoryData;
        if (!finalInventoryData) {
          finalInventoryData = await getInventoryTemplate();
          if (!finalInventoryData.date) {
            finalInventoryData.date = new Date().toISOString().split('T')[0];
          }
        }
        
        const keysToInit = { start: {}, end: {}, damaged: {}, transfers: [], payroll: [], receivables: [], discounts: [], collaborations: [], courtesies: [], employeeConsumption: [], requestsForNextDay: [], notes: '', baseCash: 0 };
        Object.keys(keysToInit).forEach(key => {
          if (!finalInventoryData[key]) {
            finalInventoryData[key] = keysToInit[key];
          }
        });

        setInventory(finalInventoryData);
        setEmployees(usersData.filter(u => u.role === 'EMPLOYEE'));
        setProducts(productsData);
      } catch (err) {
        setError('Error al cargar los datos.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleChange = (e, section = null) => {
    const { name, value } = e.target;
    if (section) {
      setInventory(prev => ({ ...prev, [section]: { ...prev[section], [name]: value } }));
    } else {
      setInventory(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayChange = (e, index, arrayName) => {
    const { name, value } = e.target;
    const newArray = [...inventory[arrayName]];
    newArray[index] = { ...newArray[index], [name]: value };
    setInventory(prev => ({ ...prev, [arrayName]: newArray }));
  };
  
  const handleExpenseChange = (e, index) => {
    const { name, value } = e.target;
    const newExpenses = [...expenses];
    newExpenses[index][name] = value;
    setExpenses(newExpenses);
  };

  const handleAddItem = (arrayName, newItem) => {
    if (arrayName === 'expenses') {
      setExpenses(prev => [...prev, newItem]);
    } else {
      setInventory(prev => ({ ...prev, [arrayName]: [...(prev[arrayName] || []), newItem] }));
    }
  };

  const handleRemoveItem = (index, arrayName) => {
    if (arrayName === 'expenses') {
      setExpenses(prev => prev.filter((_, i) => i !== index));
    } else {
      const newArray = inventory[arrayName].filter((_, i) => i !== index);
      setInventory(prev => ({ ...prev, [arrayName]: newArray }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalInventoryData = { ...inventory, expenses };
    try {
      if (inventory._id) {
        await updateInventory(inventory._id, finalInventoryData);
      } else {
        await createInventory(finalInventoryData);
      }
      alert('¡Inventario guardado con éxito!');
    } catch (err) {
      alert('Error al guardar el inventario.');
      console.error(err);
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p style={{color: 'red'}}>{error}</p>;
  if (!inventory) return <p>No hay datos para mostrar.</p>;

  return (
    <InventoryContainer>
      <Title>Registro de Inventario Diario</Title>
      
      <Form onSubmit={handleSubmit}>
        <FormSection>
          <SectionTitle>Base y Fecha</SectionTitle>
          <Grid>
            <InputGroup><Label>Dinero Base</Label><Input type="number" name="baseCash" value={inventory.baseCash} onChange={handleChange} /></InputGroup>
            <InputGroup><Label>Fecha</Label><Input type="date" name="date" value={(inventory.date || '').split('T')[0]} onChange={handleChange} /></InputGroup>
          </Grid>
        </FormSection>

        <FormSection>
          <SectionTitle>Inicio</SectionTitle>
          <Grid>
            <InputGroup><Label>Arepas Inicial</Label><Input type="number" name="arepasInitial" value={inventory.start.arepasInitial || ''} onChange={e => handleChange(e, 'start')} /></InputGroup>
            <InputGroup><Label>Arepas Nuevas</Label><Input type="number" name="arepasNew" value={inventory.start.arepasNew || ''} onChange={e => handleChange(e, 'start')} /></InputGroup>
            <InputGroup><Label>Panes Inicial</Label><Input type="number" name="panesInitial" value={inventory.start.panesInitial || ''} onChange={e => handleChange(e, 'start')} /></InputGroup>
            <InputGroup><Label>Panes Nuevos</Label><Input type="number" name="panesNew" value={inventory.start.panesNew || ''} onChange={e => handleChange(e, 'start')} /></InputGroup>
            <InputGroup><Label>Gaseosas Inicial</Label><Input type="number" name="gaseosasInitial" value={inventory.start.gaseosasInitial || ''} onChange={e => handleChange(e, 'start')} /></InputGroup>
            <InputGroup><Label>Gaseosas Nuevas</Label><Input type="number" name="gaseosasNew" value={inventory.start.gaseosasNew || ''} onChange={e => handleChange(e, 'start')} /></InputGroup>
            <InputGroup><Label>Aguas Inicial</Label><Input type="number" name="aguasInitial" value={inventory.start.aguasInitial || ''} onChange={e => handleChange(e, 'start')} /></InputGroup>
            <InputGroup><Label>Aguas Nuevas</Label><Input type="number" name="aguasNew" value={inventory.start.aguasNew || ''} onChange={e => handleChange(e, 'start')} /></InputGroup>
          </Grid>
        </FormSection>

        <FormSection>
          <SectionTitle>Final</SectionTitle>
          <Grid>
            <InputGroup><Label>Arepas Restantes</Label><Input type="number" name="arepasRemaining" value={inventory.end.arepasRemaining || ''} onChange={e => handleChange(e, 'end')} /></InputGroup>
            <InputGroup><Label>Panes Restantes</Label><Input type="number" name="panesRemaining" value={inventory.end.panesRemaining || ''} onChange={e => handleChange(e, 'end')} /></InputGroup>
            <InputGroup><Label>Gaseosas Restantes</Label><Input type="number" name="gaseosasRemaining" value={inventory.end.gaseosasRemaining || ''} onChange={e => handleChange(e, 'end')} /></InputGroup>
            <InputGroup><Label>Aguas Restantes</Label><Input type="number" name="aguasRemaining" value={inventory.end.aguasRemaining || ''} onChange={e => handleChange(e, 'end')} /></InputGroup>
          </Grid>
        </FormSection>
        
        <FormSection>
          <SectionTitle>Gastos del Día</SectionTitle>
          {expenses.map((item, index) => (
            <DynamicRow key={index} style={{gridTemplateColumns: '2fr 1fr auto'}}>
              <Input type="text" name="description" placeholder="Descripción del gasto" value={item.description} onChange={e => handleExpenseChange(e, index)} />
              <Input type="number" name="amount" placeholder="Monto" value={item.amount} onChange={e => handleExpenseChange(e, index)} />
              <DeleteButton type="button" onClick={() => handleRemoveItem(index, 'expenses')}>X</DeleteButton>
            </DynamicRow>
          ))}
          <Button type="button" onClick={() => handleAddItem('expenses', { description: '', amount: 0 })}>+ Añadir Gasto</Button>
        </FormSection>

        <FormSection>
          <SectionTitle>Nómina</SectionTitle>
          {inventory.payroll.map((item, index) => (
            <DynamicRow key={index} style={{gridTemplateColumns: '2fr 1fr auto'}}>
              <select value={item.employeeId} name="employeeId" onChange={e => handleArrayChange(e, index, 'payroll')}>
                <option value="">Seleccione empleado</option>
                {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName}</option>)}
              </select>
              <Input type="number" name="amountPaid" placeholder="Monto pagado" value={item.amountPaid} onChange={e => handleArrayChange(e, index, 'payroll')} />
              <DeleteButton type="button" onClick={() => handleRemoveItem(index, 'payroll')}>X</DeleteButton>
            </DynamicRow>
          ))}
          <Button type="button" onClick={() => handleAddItem('payroll', { employeeId: '', amountPaid: 0 })}>+ Añadir Pago</Button>
        </FormSection>

        <FormSection>
          <SectionTitle>Consumo de Empleados</SectionTitle>
          {inventory.employeeConsumption.map((item, index) => {
            const product = products.find(p => p.name === item.name);
            const subtotal = product ? product.price * (item.quantity || 0) : 0;
            return (
              <DynamicRow key={index}>
                <select value={item.name} name="name" onChange={e => handleArrayChange(e, index, 'employeeConsumption')}>
                  <option value="">Seleccione producto</option>
                  {products.map(p => <option key={p._id} value={p.name}>{p.name}</option>)}
                </select>
                <Input type="number" name="quantity" placeholder="Cantidad" value={item.quantity || ''} onChange={e => handleArrayChange(e, index, 'employeeConsumption')} />
                <Label>Valor: ${subtotal.toLocaleString('es-CO')}</Label>
                <DeleteButton type="button" onClick={() => handleRemoveItem(index, 'employeeConsumption')}>X</DeleteButton>
              </DynamicRow>
            )
          })}
          <Button type="button" onClick={() => handleAddItem('employeeConsumption', { name: '', quantity: 0 })}>+ Añadir Consumo</Button>
        </FormSection>

        <FormSection>
          <SectionTitle>Mermas (Dañados)</SectionTitle>
          <Grid>
            <InputGroup><Label>Arepas</Label><Input type="number" name="arepas" value={inventory.damaged.arepas} onChange={e => handleChange(e, 'damaged')} /></InputGroup>
            <InputGroup><Label>Panes</Label><Input type="number"name="panes" value={inventory.damaged.panes} onChange={e => handleChange(e, 'damaged')} /></InputGroup>
            <InputGroup><Label>Bebidas</Label><Input type="number" name="bebidas" value={inventory.damaged.bebidas} onChange={e => handleChange(e, 'damaged')} /></InputGroup>
            <InputGroup><Label>Gaseosas para Salsa</Label><Input type="number" name="sodaForSauce" value={inventory.sodaForSauce} onChange={handleChange} /></InputGroup>
          </Grid>
        </FormSection>

        <FormSection>
           <SectionTitle>Notas</SectionTitle>
           <Input as="textarea" rows="4" name="notes" value={inventory.notes} onChange={handleChange} placeholder="Anotaciones importantes del día..." />
        </FormSection>

        <Button type="submit">Guardar Inventario</Button>
      </Form>
    </InventoryContainer>
  );
};

export default InventoryPage;