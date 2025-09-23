import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import RegisterSaleModal from './RegisterSaleModal';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getInventoryById, getInventoryTemplate, createInventory, updateInventory, closeInventory } from '../services/inventoryService.js';
import { getUsers } from '../services/userService.js';
import { getProducts } from '../services/productService.js';
import { uploadFile } from '../services/uploadService';
import { getPurchasesByInventory, createPurchase, updatePurchase, deletePurchase } from '../services/purchaseService.js';

import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import Select from '../ui/Select.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { theme } from '../theme/theme.js';

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
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  gap: ${props => props.theme.spacing.medium};
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
  padding: 0;
`;


// --- Componente ---
const InventoryForm = () => {
  const [inventory, setInventory] = useState(null);
  const [dailyExpenses, setDailyExpenses] = useState([]); // <-- NUEVO ESTADO PARA GASTOS
  const [employees, setEmployees] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false); // Estado para feedback visual
  const { user } = useAuth();
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false)

  const refreshInventoryData = async () => {
    // Función para recargar los datos del inventario actual
    if (inventory?._id) {
      const data = await getInventoryById(inventory._id);
      setInventory(data);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        const [usersData, productsData] = await Promise.all([
          getUsers().catch(() => []),
          getProducts().catch(() => [])
        ]);

        let inventoryData;
        if (id === 'new') {
          inventoryData = await getInventoryTemplate();
          inventoryData.date = searchParams.get('date') || new Date().toISOString().split('T')[0];
          setDailyExpenses([]); // Para un inventario nuevo, los gastos empiezan en cero
        } else {
          // Si es un inventario existente, cargamos el inventario Y sus compras asociadas
          const [mainInventoryData, purchaseData] = await Promise.all([
            getInventoryById(id),
            getPurchasesByInventory(id)
          ]);
          inventoryData = mainInventoryData;
          setDailyExpenses(purchaseData);
        }

        const keysToInit = { start: {}, end: {}, damaged: {}, payroll: [], employeeConsumption: [], notes: '', baseCash: 0, finalCash: 0 };
        Object.keys(keysToInit).forEach(key => {
          if (!inventoryData[key]) {
            inventoryData[key] = keysToInit[key];
          }
        });

        setInventory(inventoryData);
        setEmployees(usersData.filter(u => u.role === 'EMPLOYEE'));
        setProducts(productsData);
      } catch (err) {
        setError('Error al cargar los datos del inventario.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, searchParams]);

  const salesTotals = useMemo(() => {
    if (!inventory?.sales) {
      return { cash: 0, transfer: 0 };
    }

    return inventory.sales.reduce((totals, sale) => {
      // Solo suma el total si la venta NO es una cortesía en su totalidad
      const saleTotal = sale.items
        .filter(item => !item.isCourtesy)
        .reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

      if (sale.paymentMethod === 'CASH') {
        totals.cash += saleTotal;
      } else if (sale.paymentMethod === 'TRANSFER') {
        totals.transfer += saleTotal;
      }
      console.log('salesTotals recalculado:', totals);
      return totals;

    }, { cash: 0, transfer: 0 });
  }, [inventory?.sales]); // Se recalcula solo si las ventas cambian


  // --- MANEJADORES DE ESTADO SIMPLIFICADOS ---

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
    let currentItem = { ...newArray[index] };

    // Actualiza el campo que cambió
    currentItem[name] = value;

    // Lógica especial para 'Colaboraciones'
    if (arrayName === 'collaborations') {
      // Si el campo que cambió es 'type' (a Producto o Efectivo)...
      if (name === 'type') {
        // ...reseteamos los otros campos para evitar datos inconsistentes.
        currentItem.description = '';
        currentItem.value = 0;
      }
      // Si el campo que cambió es 'description' (o sea, se eligió un producto)...
      if (name === 'description') {
        const SelectedProduct = products.find(p => p.name === value);
        if (SelectedProduct) {
          // ...automáticamente ponemos su precio en el campo 'value'.
          currentItem.value = SelectedProduct.price;
        }
      }
    }

    newArray[index] = currentItem;
    setInventory(prev => ({ ...prev, [arrayName]: newArray }));
  };

  // Función genérica para añadir a cualquier arreglo del inventario
  const handleAddItem = (arrayName, newItem) => {
    setInventory(prev => ({
      ...prev,
      [arrayName]: [...(prev[arrayName] || []), newItem]
    }));
  };

  // Función genérica para remover de cualquier arreglo del inventario
  const handleRemoveItem = (index, arrayName) => {
    const newArray = inventory[arrayName].filter((_, i) => i !== index);
    setInventory(prev => ({ ...prev, [arrayName]: newArray }));
  };

  // --- NUEVOS HANDLERS PARA GASTOS EN TIEMPO REAL ---
  const handleAddExpense = async () => {
    if (!inventory._id) {
      alert("Primero debes guardar el inventario una vez para poder añadir gastos.");
      return;
    }
    const newPurchaseData = {
      items: [{ name: 'Nuevo Gasto', unitPrice: 0, quantity: 1 }],
      total: 0,
      inventoryId: inventory._id,
      date: inventory.date
    };
    const newPurchase = await createPurchase(newPurchaseData);
    setDailyExpenses(prev => [...prev, newPurchase]);
  };

  const handleExpenseChange = async (e, index) => {
    const { name, value } = e.target;
    const updatedExpenses = [...dailyExpenses];
    const expenseToUpdate = { ...updatedExpenses[index] };

    // Asumimos que los items tienen un solo elemento por simplicidad
    if (name === 'description') expenseToUpdate.items[0].name = value;
    if (name === 'amount') {
      expenseToUpdate.items[0].unitPrice = Number(value);
      expenseToUpdate.total = Number(value);
    }

    updatedExpenses[index] = expenseToUpdate;
    setDailyExpenses(updatedExpenses);

    // Guardar en la base de datos en segundo plano
    await updatePurchase(expenseToUpdate._id, { total: expenseToUpdate.total, items: expenseToUpdate.items });
  };

  const handleDeleteExpense = async (index) => {
    const expenseToDelete = dailyExpenses[index];
    await deletePurchase(expenseToDelete._id);
    setDailyExpenses(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (inventory._id) {
        await updateInventory(inventory._id, inventory);
      } else {
        const newInventory = await createInventory(inventory);
        // Navegamos a la URL de edición para "activar" la sección de gastos
        navigate(`/inventory/form/${newInventory._id}`, { replace: true });
      }
      alert('¡Inventario guardado con éxito!');
    } catch (err) {
      alert('Error al guardar el inventario.');
      console.error(err);
    }
  };

  const handleCloseInventory = async () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar este inventario? Esta acción guardará todos los cambios y es final.')) {
      try {
        // 👈 PASA EL ESTADO 'inventory' A LA FUNCIÓN
        await closeInventory(inventory._id, inventory);
        alert('Inventario cerrado exitosamente.');
        navigate('/inventory'); // Vuelve al calendario
      } catch (error) {
        alert('Error al cerrar el inventario.');
      }
    }
  };

  const handleFileUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const imageUrl = await uploadFile(file);

      // Actualiza la compra existente con la nueva URL de la imagen
      const expenseToUpdate = dailyExpenses[index];
      const updatedData = { ...expenseToUpdate, invoiceEvidenceUrl: imageUrl };
      await updatePurchase(expenseToUpdate._id, updatedData);

      // Actualiza el estado local para que la UI refleje el cambio
      const updatedExpenses = [...dailyExpenses];
      updatedExpenses[index].invoiceEvidenceUrl = imageUrl;
      setDailyExpenses(updatedExpenses);

    } catch (error) {
      alert("Error al subir la imagen.");
    } finally {
      setIsUploading(false);
    }
  };


  if (loading) return <p>Cargando...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!inventory) return <p>No hay datos para mostrar.</p>;

  return (
    <InventoryContainer>
      {/* --- RENDERIZADO DEL MODAL DE VENTA --- */}
      {inventory && <RegisterSaleModal
        isOpen={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        products={products}
        inventoryId={inventory._id}
        onSaleRegistered={refreshInventoryData}
      />}
      <Title>Registro de Inventario Diario</Title>

      <Form onSubmit={handleSubmit}>
        {/** BASE Y FECHA  */}
        <FormSection>
          <SectionTitle>Base y Fecha</SectionTitle>
          <Grid>
            <InputGroup><Label>Dinero Base</Label><Input type="number" name="baseCash" value={inventory.baseCash} onChange={handleChange} /></InputGroup>
            <InputGroup><Label>Fecha</Label><Input type="date" name="date" value={(inventory.date || '').split('T')[0]} onChange={handleChange} /></InputGroup>
          </Grid>
        </FormSection>

        {/** INVENTARIO INICIAL  */}
        <FormSection>
          <SectionTitle>Inicio</SectionTitle>
          <Grid>
            <InputGroup><Label>Arepas Inicial</Label><Input type="number" name="arepasInitial" value={inventory.start?.arepasInitial || ''} onChange={e => handleChange(e, 'start')} /></InputGroup>
            <InputGroup><Label>Arepas Nuevas</Label><Input type="number" name="arepasNew" value={inventory.start?.arepasNew || ''} onChange={e => handleChange(e, 'start')} /></InputGroup>
            <InputGroup><Label>Panes Inicial</Label><Input type="number" name="panesInitial" value={inventory.start?.panesInitial || ''} onChange={e => handleChange(e, 'start')} /></InputGroup>
            <InputGroup><Label>Panes Nuevos</Label><Input type="number" name="panesNew" value={inventory.start?.panesNew || ''} onChange={e => handleChange(e, 'start')} /></InputGroup>
            <InputGroup><Label>Gaseosas Inicial</Label><Input type="number" name="gaseosasInitial" value={inventory.start?.gaseosasInitial || ''} onChange={e => handleChange(e, 'start')} /></InputGroup>
            <InputGroup><Label>Gaseosas Nuevas</Label><Input type="number" name="gaseosasNew" value={inventory.start?.gaseosasNew || ''} onChange={e => handleChange(e, 'start')} /></InputGroup>
            <InputGroup><Label>Aguas Inicial</Label><Input type="number" name="aguasInitial" value={inventory.start?.aguasInitial || ''} onChange={e => handleChange(e, 'start')} /></InputGroup>
            <InputGroup><Label>Aguas Nuevas</Label><Input type="number" name="aguasNew" value={inventory.start?.aguasNew || ''} onChange={e => handleChange(e, 'start')} /></InputGroup>
          </Grid>
        </FormSection>

        {/** VENTAS */}
        <FormSection>
          <SectionTitle>Ventas Registradas</SectionTitle>
          {/* Botón para abrir el modal */}
          <Button type="button" onClick={() => setIsSaleModalOpen(true)} disabled={!inventory?._id}>
            + Registrar Nueva Venta
          </Button>
          {!inventory?._id && <Label>Guarda el inventario por primera vez para poder registrar ventas.</Label>}

          {/* Lista de ventas del día */}
          <div style={{ marginTop: '16px' }}>
            {inventory?.sales?.map(sale => (
              <div key={sale._id}>
                {/* Aquí puedes mostrar un resumen de cada venta */}
                <p>Venta de ${sale.total.toLocaleString('es-CO')} a las {new Date(sale.timestamp).toLocaleTimeString()}</p>
                {
                  sale.items.map((item, idx) => (
                    <div key={idx} style={{ marginLeft: '16px' }}>
                      <span>{item.quantity} x {item.productName} @ ${item.unitPrice.toLocaleString('es-CO')} c/u</span>
                    </div>
                  ))
                }
              </div>
            ))}
            {inventory?.sales?.length === 0 && <p>No hay ventas registradas para este día.</p>}
          </div>
        </FormSection>

        {/** DINERO  */}
        <FormSection>
          <SectionTitle>Dinero</SectionTitle>
          <Grid>

            {/** TRANSFERENCIAS  */}
            <InputGroup>
              <Label>Total en Transferencias (Calculado)</Label>
              {/* Este campo ahora es de solo lectura y muestra el total calculado */}
              <Input
                type="text"
                name="totalTransfers"
                value={`$${salesTotals.transfer.toLocaleString('es-CO')}`}
                style={{ fontWeight: 'bold', color: theme.colors.accent }}
              />
            </InputGroup>
            {/** EFECTIVO  */}
            <InputGroup>
              <Label>Total en Efectivo</Label>
              {/* Este campo ahora es de solo lectura y muestra el total calculado */}
              <Input
                type="text"
                name="totalTransfers"
                value={`$${salesTotals.cash.toLocaleString('es-CO')}`}
                style={{ fontWeight: 'bold', color: theme.colors.accent }}
              />
            </InputGroup>

          </Grid>
        </FormSection>

        {/** INVENTARIO FINAL  */}
        <FormSection>
          <SectionTitle>Final</SectionTitle>
          <Grid>
            <InputGroup><Label>Arepas Restantes</Label><Input type="number" name="arepasRemaining" value={inventory.end?.arepasRemaining || ''} onChange={e => handleChange(e, 'end')} /></InputGroup>
            <InputGroup><Label>Panes Restantes</Label><Input type="number" name="panesRemaining" value={inventory.end?.panesRemaining || ''} onChange={e => handleChange(e, 'end')} /></InputGroup>
            <InputGroup><Label>Gaseosas Restantes</Label><Input type="number" name="gaseosasRemaining" value={inventory.end?.gaseosasRemaining || ''} onChange={e => handleChange(e, 'end')} /></InputGroup>
            <InputGroup><Label>Aguas Restantes</Label><Input type="number" name="aguasRemaining" value={inventory.end?.aguasRemaining || ''} onChange={e => handleChange(e, 'end')} /></InputGroup>
          </Grid>
        </FormSection>

        {/** GASTOS DEL DIA  */}
        <FormSection>
          <SectionTitle>Gastos del Día</SectionTitle>
          {dailyExpenses.map((item, index) => (
            <div key={item._id}>
              <DynamicRow style={{ gridTemplateColumns: '2fr 1fr auto' }}>
                <Input
                  type="text"
                  name="description"
                  placeholder="Descripción del gasto"
                  defaultValue={item.items[0]?.name || ''}
                  onBlur={e => handleExpenseChange(e, index)}
                />
                <Input
                  type="number"
                  name="amount"
                  placeholder="Monto"
                  defaultValue={item.total || 0}
                  onBlur={e => handleExpenseChange(e, index)}
                />
                <DeleteButton type="button" onClick={() => handleDeleteExpense(index)}>X</DeleteButton>
              </DynamicRow>
              <div style={{ marginTop: '8px' }}>
                <Input
                  type="file"
                  onChange={(e) => handleFileUpload(e, index)}
                  style={{ fontSize: '0.8rem', padding: '5px' }}
                />
                {item.invoiceEvidenceUrl && (
                  <a
                    href={item.invoiceEvidenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ marginLeft: '16px', color: '#00BFFF', textDecoration: 'none' }}
                  >
                    Ver Soporte
                  </a>
                )}
              </div>
            </div>
          ))}
          <Button type="button" onClick={handleAddExpense} disabled={!inventory._id || isUploading}>
            {isUploading ? 'Subiendo...' : '+ Añadir Gasto'}
          </Button>
          {!inventory._id && <Label style={{ fontSize: '0.8rem', textAlign: 'center' }}>
            Guarda el inventario por primera vez para poder añadir gastos.
          </Label>}
        </FormSection>

        {/** CONSUMO DE EMPLEADOS */}
        <FormSection>
          <SectionTitle>Consumo de Empleados</SectionTitle>
          {inventory.employeeConsumption.map((item, index) => {
            const product = products.find(p => p.name === item.name);
            const subtotal = product ? product.price * (item.quantity || 0) : 0;
            return (
              <DynamicRow key={index}>
                <div>
                  <Select value={item.name} name="name" onChange={e => handleArrayChange(e, index, 'employeeConsumption')}>
                    <option value="">Seleccione producto</option>
                    {products.map(p => <option key={p._id} value={p.name}>{p.name}</option>)}
                  </Select>
                  <div>
                    <Input type="number" name="quantity" placeholder="Cantidad" value={item.quantity || ''} onChange={e => handleArrayChange(e, index, 'employeeConsumption')} />
                    <Label>Valor: ${subtotal.toLocaleString('es-CO')}</Label>
                  </div>
                </div>
                <DeleteButton type="button" onClick={() => handleRemoveItem(index, 'employeeConsumption')}>X</DeleteButton>
              </DynamicRow>
            )
          })}
          <Button type="button" onClick={() => handleAddItem('employeeConsumption', { name: '', quantity: 0 })}>+ Añadir Consumo</Button>
        </FormSection>

        {/** MERMAS  */}
        <FormSection>
          <SectionTitle>Mermas (Dañados)</SectionTitle>
          <Grid>
            <InputGroup><Label>Arepas</Label><Input type="number" name="arepas" value={inventory.damaged?.arepas || ''} onChange={e => handleChange(e, 'damaged')} /></InputGroup>
            <InputGroup><Label>Panes</Label><Input type="number" name="panes" value={inventory.damaged?.panes || ''} onChange={e => handleChange(e, 'damaged')} /></InputGroup>
            <InputGroup><Label>Bebidas</Label><Input type="number" name="bebidas" value={inventory.damaged?.bebidas || ''} onChange={e => handleChange(e, 'damaged')} /></InputGroup>
            <InputGroup><Label>Gaseosas para Salsa</Label><Input type="number" name="sodaForSauce" value={inventory.sodaForSauce || ''} onChange={handleChange} /></InputGroup>
          </Grid>
        </FormSection>

        {/** DESCUENTOS  */}
        <FormSection>
          <SectionTitle>Descuentos</SectionTitle>
          {inventory.discounts?.map((item, index) => (
            <>
              <DynamicRow key={index} style={{ gridTemplateColumns: '2fr 1fr 1fr auto' }}>
                <Input type="text" name="description" placeholder="Descripción" value={item.description || ''} onChange={e => handleArrayChange(e, index, 'discounts')} />
                <Input type="number" name="originalAmount" placeholder="Monto Original" value={item.originalAmount || ''} onChange={e => handleArrayChange(e, index, 'discounts')} />
                <Input type="number" name="finalAmount" placeholder="Monto Final" value={item.finalAmount || ''} onChange={e => handleArrayChange(e, index, 'discounts')} />
                <DeleteButton type="button" onClick={() => handleRemoveItem(index, 'discounts')}>X</DeleteButton>
              </DynamicRow>
              <hr />
            </>
          ))}
          <Button type="button" onClick={() => handleAddItem('discounts', { description: '', originalAmount: 0, finalAmount: 0 })}>+ Añadir Descuento</Button>
        </FormSection>

        {/** COLABORACIONES  */}
        <FormSection>
          <SectionTitle>Colaboraciones</SectionTitle>
          {inventory.collaborations?.map((item, index) => (
            <div key={index}>
              <DynamicRow>
                <Input
                  type="text"
                  name="personName"
                  placeholder="Nombre de la persona"
                  value={item.personName || ''}
                  onChange={e => handleArrayChange(e, index, 'collaborations')}
                />
                <Select
                  name="type"
                  value={item.type || 'PRODUCT'}
                  onChange={e => handleArrayChange(e, index, 'collaborations')}
                >
                  <option value="PRODUCT">Producto</option>
                  <option value="CASH">Efectivo</option>
                </Select>

                {/* --- RENDERIZADO CONDICIONAL AQUÍ --- */}
                {item.type === 'PRODUCT' ? (
                  <Select
                    name="description" // Usamos 'description' para guardar el nombre del producto
                    value={item.description || ''}
                    onChange={e => handleArrayChange(e, index, 'collaborations')}
                  >
                    <option value="">Seleccione producto</option>
                    {products.map(p => <option key={p._id} value={p.name}>{p.name}</option>)}
                  </Select>
                ) : (
                  <Input
                    type="number"
                    name="value"
                    placeholder="Monto en efectivo"
                    value={item.value || ''}
                    onChange={e => handleArrayChange(e, index, 'collaborations')}
                  />
                )}

                <DeleteButton type="button" onClick={() => handleRemoveItem(index, 'collaborations')}>X</DeleteButton>
              </DynamicRow>

              {/* Muestra el valor solo si es un producto seleccionado */}
              {item.type === 'PRODUCT' && item.description && (
                <Label style={{ textAlign: 'right', marginTop: '4px' }}>
                  Valor estimado: ${item.value?.toLocaleString('es-CO') || 0}
                </Label>
              )}
            </div>
          ))}
          <Button type="button" onClick={() => handleAddItem('collaborations', { personName: '', type: 'PRODUCT', description: '', value: 0 })}>
            + Añadir Colaboración
          </Button>
        </FormSection>

        {/** PEDIDOS PROXIMO DIA  */}
        <FormSection>
          <SectionTitle>Pedidos Próximo Día</SectionTitle>
          {inventory.requestsForNextDay?.map((item, index) => (
            <DynamicRow key={index} style={{ gridTemplateColumns: '2fr 1fr auto' }}>
              <Input type="text" name="item" placeholder="Item a pedir" value={item.item || ''} onChange={e => handleArrayChange(e, index, 'requestsForNextDay')} />
              <Input type="number" name="quantity" placeholder="Cantidad" value={item.quantity || ''} onChange={e => handleArrayChange(e, index, 'requestsForNextDay')} />
              <DeleteButton type="button" onClick={() => handleRemoveItem(index, 'requestsForNextDay')}>X</DeleteButton>
            </DynamicRow>
          ))}
          <Button type="button" onClick={() => handleAddItem('requestsForNextDay', { item: '', quantity: 1 })}>+ Añadir Pedido</Button>
        </FormSection>

        {/** NOTAS  */}
        <FormSection>
          <SectionTitle>Notas</SectionTitle>
          <Input as="textarea" rows="4" name="notes" value={inventory.notes || ''} onChange={handleChange} placeholder="Anotaciones importantes del día..." />
        </FormSection>

        {user && user.role === 'ADMIN' && (
          <>
            <FormSection>
              <SectionTitle>Nómina</SectionTitle>
              {inventory.payroll.map((item, index) => (
                <DynamicRow key={index} style={{ gridTemplateColumns: '2fr 1fr auto' }}>
                  <div>
                    <Select value={item.employeeId} name="employeeId" onChange={e => handleArrayChange(e, index, 'payroll')}>
                      <option value="">Seleccione empleado</option>
                      {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName}</option>)}
                    </Select>
                    <Input type="number" name="amountPaid" placeholder="Monto pagado" value={item.amountPaid} onChange={e => handleArrayChange(e, index, 'payroll')} />
                  </div>
                  <DeleteButton type="button" onClick={() => handleRemoveItem(index, 'payroll')}>X</DeleteButton>
                </DynamicRow>
              ))}
              <Button type="button" onClick={() => handleAddItem('payroll', { employeeId: '', amountPaid: 0 })}>+ Añadir Pago</Button>
            </FormSection>
          </>
        )}

        <div>
          <Button type="submit">Guardar Cambios</Button>
          {inventory.status === 'ACTIVE' && inventory._id && user.role === 'ADMIN' && (
            <Button type="button" onClick={handleCloseInventory} style={{ backgroundColor: '#FFC700', marginLeft: '16px' }}>
              Cerrar Inventario
            </Button>
          )}
        </div>
      </Form>
    </InventoryContainer>
  );
};

export default InventoryForm;