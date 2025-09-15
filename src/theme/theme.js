// Este objeto contendrá todas las variables de nuestro diseño.
export const theme = {
  colors: {
    primary: '#FF1E1E',      // Rojo Neón
    background: '#1B1B1B',   // Negro Carbón
    cardBackground: '#2C2C2C', // Gris Acero
    text: '#F5F5F5',         // Blanco Hueso
    accent: '#FFC700',       // Amarillo Llama
    success: '#27AE60',
    error: '#E74C3C',
  },
  fonts: {
    main: 'system-ui, sans-serif',
  },
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px',
  },
  borderRadius: '8px',
  
  // --- AÑADIMOS BREAKPOINTS ---
  breakpoints: {
    tablet: '768px',
    desktop: '1024px',
  },
};