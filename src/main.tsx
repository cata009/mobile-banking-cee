import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/app/App';
import '@/styles/index.css';

// Standard Vite entry point - render App component
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
