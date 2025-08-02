import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { payeeService } from './services/payeeService';

// Expose payeeService to global window for testing
declare global {
  interface Window {
    payeeService: typeof payeeService;
  }
}

window.payeeService = payeeService;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
