import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store/store';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Redux Provider wraps everything — store is accessible to all components */}
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
