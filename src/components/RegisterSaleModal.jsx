import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import Modal from 'react-modal';
import { addSaleToInventory } from '../services/inventoryService';
import Button from '../ui/Button';
import Input from '../ui/Input';
import StyledSelect from '../ui/Select';
import { theme } from '../theme/theme';

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


const SaleForm = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  align-items: flex-end;
`;

const CartItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px;
  border-bottom: 1px solid #444;
`;

const TotalDisplay = styled.h3`
  text-align: right;
  margin-top: 16px;
  color: ${props => props.theme.colors.accent};
`;

const RegisterSaleModal = ({ isOpen, onClose, products, inventoryId, onSaleRegistered }) => {
    const [cartItems, setCartItems] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('CASH');

    const handleAddItemToCart = () => {
        if (!selectedProductId || quantity <= 0) return;
        const product = products.find(p => p._id === selectedProductId);
        if (product) {
            setCartItems(prev => [...prev, {
                productName: product.name,
                quantity: Number(quantity),
                unitPrice: product.price,
                isCourtesy: false
            }]);
            // Resetear para el siguiente item
            setSelectedProductId('');
            setQuantity(1);
        }
    };

    // 👈 NUEVA FUNCIÓN para marcar/desmarcar como cortesía
    const toggleCourtesy = (index) => {
        const newCartItems = [...cartItems];
        newCartItems[index].isCourtesy = !newCartItems[index].isCourtesy;
        setCartItems(newCartItems);
    };

    const handleRegisterSale = async () => {
        if (cartItems.length === 0) return;

        const saleData = {
            items: cartItems,
            total: totalSale,
            paymentMethod: paymentMethod
        };

        try {
            await addSaleToInventory(inventoryId, saleData);
            onSaleRegistered(); // Avisa al componente padre que la venta fue exitosa
            handleClose();
        } catch (error) {
            alert('Error al registrar la venta.');
            console.error(error);
        }
    };

    const handleClose = () => {
        setCartItems([]);
        setSelectedProductId('');
        setQuantity(1);

        onClose();
    };

    const totalSale = useMemo(() => {
        // 👈 CÁLCULO ACTUALIZADO: solo suma los items que NO son cortesía
        return cartItems
            .filter(item => !item.isCourtesy)
            .reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    }, [cartItems]);

    return (
        <Modal isOpen={isOpen} onRequestClose={handleClose} style={customModalStyles}>
            <h2>Registrar Nueva Venta</h2>
            <SaleForm>
                <div>
                    <label>Producto</label>
                    <StyledSelect value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)}>
                        <option value="">Seleccione...</option>
                        {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </StyledSelect>
                </div>
                <div>
                    <label>Cantidad</label>
                    <Input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} min="1" />
                </div>
                <Button type="button" onClick={handleAddItemToCart}>Añadir</Button>
            </SaleForm>

            <hr />

            <div>
                <h4>Items de la Venta (Marcar <input className='courtesy-checkbox'
                    type="checkbox"
                    checked
                    onClick={(e) => e.preventDefault()}
                /> si es cortesia) :</h4>
                {cartItems.map((item, index) => (
                    <CartItem key={index}>
                        <div>
                            <input
                                type="checkbox"
                                checked={item.isCourtesy}
                                onChange={() => toggleCourtesy(index)}
                                id={`courtesy-${index}`}
                            />
                            <label htmlFor={`courtesy-${index}`} style={{ marginLeft: '8px' }}>
                                {item.quantity} x {item.productName} {item.isCourtesy && '(Cortesía)'}
                            </label>
                        </div>
                        {/* Si es cortesía, el precio es $0 */}
                        <span style={{ textDecoration: item.isCourtesy ? 'line-through' : 'none' }}>
                            ${(item.unitPrice * item.quantity).toLocaleString('es-CO')}
                        </span>
                    </CartItem>
                ))}
                {cartItems.length === 0 && <p>Aún no hay items en la venta.</p>}
            </div>

            <TotalDisplay>Total a Pagar: ${totalSale.toLocaleString('es-CO')}</TotalDisplay>

            {/* --- NUEVO SELECTOR DE MÉTODO DE PAGO --- */}
            <div style={{ marginTop: '16px' }}>
                <label>Método de Pago</label>
                <StyledSelect value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                    <option value="CASH">Efectivo</option>
                    <option value="TRANSFER">Transferencia</option>
                </StyledSelect>
            </div>

            <Button onClick={handleRegisterSale} disabled={cartItems.length === 0} style={{ width: '100%', marginTop: '16px' }}>
                Confirmar Venta
            </Button>
        </Modal>
    );
};

export default RegisterSaleModal;