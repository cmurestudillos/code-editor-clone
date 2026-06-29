import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/raleway/latin-300.css';
import '@fontsource/raleway/latin-400.css';
import '@fontsource/raleway/latin-500.css';
import '@fontsource/raleway/latin-600.css';
import '@fontsource/fira-code/latin-400.css';
import './assets/index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
