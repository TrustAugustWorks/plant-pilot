import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { IndexedDbStorage } from '../storage/indexedDbStorage';
import { App } from './App';
import { systemClock } from './clock';
import '../ui/styles.css';

const storage = new IndexedDbStorage();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App storage={storage} clock={systemClock} />
  </StrictMode>,
);
