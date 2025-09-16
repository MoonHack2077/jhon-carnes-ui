import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import DatePicker from 'react-datepicker';
import Modal from 'react-modal';
import { getPurchases, createPurchase, updatePurchase, deletePurchase } from '../services/purchaseService';
import { uploadFile } from '../services/uploadService';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { theme } from '../theme/theme';

Modal.setAppElement('#root');

// --- Estilos ---
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
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPurchases = async () => {
      setIsLoading(true);
      try {
        const data = await getPurchases(startDate, endDate);
        setPurchases(data);
      } catch (error) {
        console.error("Error al cargar las compras:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPurchases();
  }, [startDate, endDate]);

  const openModalForCreate = () => {
    setEditingPurchase(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      items: [{ name: '', unitPrice: 0, quantity: 1 }],
      total: 0
    });
    setIsModalOpen(true);
  };

  const openModalForEdit = (purchase) => {
    setEditingPurchase(purchase);
    setFormData(purchase);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPurchase(null);
    setFormData({});
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'itemName' || name === 'itemPrice') {
      const newItems = [...(formData.items || [{ name: '', unitPrice: 0, quantity: 1 }])];
      if (name === 'itemName') newItems[0].name = value;
      if (name === 'itemPrice') {
        newItems[0].unitPrice = Number(value);
        setFormData(prev => ({ ...prev, items: newItems, total: Number(value) }));
      } else {
        setFormData(prev => ({ ...prev, items: newItems }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const imageUrl = await uploadFile(file);
      setFormData(prev => ({ ...prev, invoiceEvidenceUrl: imageUrl }));
    } catch (error) {
      alert("Error al subir la imagen.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingPurchase) {
        await updatePurchase(editingPurchase._id, formData);
      } else {
        await createPurchase(formData);
      }
      closeModal();
      // Refresca la lista sin cambiar las fechas
      const data = await getPurchases(startDate, endDate);
      setPurchases(data);
    } catch (err) {
      setError(err.message || 'Error al guardar la compra.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta compra?')) {
      try {
        await deletePurchase(id);
        const data = await getPurchases(startDate, endDate);
        setPurchases(data);
      } catch (error) {
        console.error("Error al eliminar la compra:", error);
      }
    }
  };

  if (isLoading) return <p>Cargando compras...</p>;

  return (
    <PurchasesContainer>
      <Title>Gestión de Compras y Gastos</Title>
      
      <div style={{ marginBottom: '16px' }}>
        <DatePicker
          selectsRange={true}
          startDate={startDate}
          endDate={endDate}
          onChange={(update) => {
            setStartDate(update[0]);
            setEndDate(update[1]);
          }}
          isClearable={true}
          dateFormat="dd/MM/yyyy"
        />
      </div>
      
      <Button onClick={openModalForCreate}>+ Nueva Compra</Button>

      <Table>
        <thead>
          <tr>
            <Th>Fecha</Th>
            <Th>Proveedor/Descripción</Th>
            <Th>Total</Th>
            <Th>Soporte</Th>
            <Th>Acciones</Th>
          </tr>
        </thead>
        <tbody>
          {purchases.map(purchase => (
            <tr key={purchase._id}>
              <Td>
                {(() => {
                  const [year, month, day] = purchase.date.split('T')[0].split('-');
                  return `${day}/${month}/${year}`;
                })()}
              </Td>
              <Td>{purchase.supplier || purchase.items[0]?.name}</Td>
              <Td>${(purchase.total || 0).toLocaleString('es-CO')}</Td>
              <Td>
                {purchase.invoiceEvidenceUrl ? (
                  <a href={purchase.invoiceEvidenceUrl} target="_blank" rel="noopener noreferrer" style={{color: '#00BFFF'}}>Ver</a>
                ) : 'No'}
              </Td>
              <Td>
                <Button onClick={() => openModalForEdit(purchase)} style={{marginRight: '8px'}}>Editar</Button>
                <Button onClick={() => handleDelete(purchase._id)} style={{backgroundColor: '#E74C3C'}}>Eliminar</Button>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
      
      <Modal isOpen={isModalOpen} onRequestClose={closeModal} style={customModalStyles}>
        <h2>{editingPurchase ? 'Editar Compra' : 'Nueva Compra'}</h2>
        {error && <p style={{color: 'red'}}>{error}</p>}
        <form onSubmit={handleFormSubmit}>
          <Input name="supplier" placeholder="Proveedor (Opcional)" value={formData.supplier || ''} onChange={handleInputChange} />
          <Input name="itemName" placeholder="Descripción del item" value={formData.items?.[0]?.name || ''} onChange={handleInputChange} required />
          <Input name="itemPrice" type="number" placeholder="Total" value={formData.total || ''} onChange={handleInputChange} required />
          <Input name="date" type="date" value={(formData.date || '').split('T')[0]} onChange={handleInputChange} required />
          <hr />
          <label>Soporte de Factura</label>
          <Input type="file" onChange={handleFileUpload} />
          {formData.invoiceEvidenceUrl && (
            <a href={formData.invoiceEvidenceUrl} target="_blank" rel="noopener noreferrer">Ver soporte actual</a>
          )}
          <Button type="submit" disabled={isUploading} style={{marginTop: '16px'}}>
            {isUploading ? 'Subiendo imagen...' : (editingPurchase ? 'Guardar Cambios' : 'Crear Compra')}
          </Button>
        </form>
      </Modal>

    </PurchasesContainer>
  );
};

export default PurchasesPage;