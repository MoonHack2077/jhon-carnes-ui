import React from 'react';
import ReactDOM from 'react-dom/client';
import 'react-calendar/dist/Calendar.css';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components'; // 👈 1. Importa ThemeProvider
import { AuthProvider } from './context/AuthContext';
import { theme } from './theme/theme'; // 👈 2. Importa nuestro tema
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider theme={theme}> {/* 👈 3. Envuelve la App con el tema */}
          <App />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);